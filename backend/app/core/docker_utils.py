from docker import DockerClient
import logging
from pathlib import Path
from typing import Tuple
import docker.errors
import os
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class DockerExecutionError(Exception):
    """Custom exception for Docker execution failures"""
    pass

class DockerManager:
    def __init__(self):
        self.client = DockerClient.from_env()
        
    async def execute_script(self, script_path: Path, language: str) -> Tuple[bool, str]:
        container = None
        try:
            # Ensure script exists and is accessible
            if not script_path.exists():
                error_msg = f"Script file not found at {script_path}"
                logger.error(error_msg)
                return False, error_msg
                
            # Get absolute path to ensure correct mounting
            script_path = script_path.absolute()
            script_dir = script_path.parent
            script_filename = script_path.name
            output_dir = settings.OUTPUTS_DIR.absolute()
            
            # Debug logging
            logger.info(f"Script absolute path: {script_path}")
            logger.info(f"Script dir: {script_dir}")
            logger.info(f"Output dir: {output_dir}")
            logger.info(f"Script filename: {script_filename}")
            logger.info(f"Script file exists: {script_path.exists()}")
            logger.info(f"Script file size: {script_path.stat().st_size} bytes")
            logger.info(f"Script file permissions: {oct(script_path.stat().st_mode)[-3:]}")

            # Create volumes configuration with absolute paths - mount both scripts and outputs directories
            volumes = {
                str(script_dir): {'bind': '/scripts', 'mode': 'ro'},
                str(output_dir): {'bind': '/outputs', 'mode': 'rw'}
            }

            # Select Docker image and run command
            image = 'python-viz' if language == 'python' else 'r-viz'
            
            # Adjust commands to save outputs to the mounted outputs directory
            if language == 'python':
                command = f'python /scripts/{script_filename}'
            else:
                command = f'Rscript /scripts/{script_filename}'
                
            logger.info(f"Running container with command: {command}")
            logger.info(f"Mounting volumes: {script_dir} -> /scripts, {output_dir} -> /outputs")

            # Run container
            container = self.client.containers.run(
                image=image,
                command=command,
                volumes=volumes,
                working_dir='/scripts',
                network_disabled=settings.DOCKER_NETWORK_ACCESS,
                mem_limit=settings.DOCKER_MEMORY_LIMIT,
                cpu_period=100000,
                cpu_quota=int(settings.DOCKER_CPU_LIMIT * 100000),
                remove=False,
                detach=True
            )

            # Wait for container to complete
            result = container.wait(timeout=settings.DOCKER_TIMEOUT)
            
            # Capture logs before removal
            logs = container.logs().decode('utf-8')
            
            # Debug container filesystem
            try:
                exec_result = container.exec_run('ls -la /scripts')
                logger.info(f"Container scripts contents: {exec_result.output.decode('utf-8')}")
                exec_result = container.exec_run('ls -la /outputs')
                logger.info(f"Container outputs contents: {exec_result.output.decode('utf-8')}")
            except Exception as e:
                logger.error(f"Failed to list container contents: {str(e)}")
            
            # Remove container after getting logs
            if container:
                container.remove(force=True)
                logger.info("Container removed successfully")

            if result['StatusCode'] != 0:
                logger.error(f"Script execution failed with logs: {logs}")
                return False, logs

            logger.info("Script execution completed successfully")
            return True, logs

        except docker.errors.ContainerError as e:
            error_msg = f"Container execution error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
            
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
            
        finally:
            # Ensure container cleanup in case of errors
            if container:
                try:
                    container.remove(force=True)
                    logger.info("Container cleanup complete")
                except docker.errors.NotFound:
                    pass
                except Exception as e:
                    logger.error(f"Error cleaning up container: {str(e)}")

    async def check_health(self) -> bool:
        """Check if Docker service is available and running"""
        try:
            self.client.ping()
            return True
        except Exception as e:
            logger.error(f"Docker health check failed: {str(e)}")
            return False