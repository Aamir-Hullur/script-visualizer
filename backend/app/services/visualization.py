import logging
from pathlib import Path
from uuid import uuid4
import re
from app.models.schemas import VisualizationRequest, VisualizationResponse
from app.core.docker_utils import DockerManager
from app.core.config import get_settings

logger = logging.getLogger("visualization-api")
settings = get_settings()

class VisualizationService:
    def __init__(self):
        self.docker_manager = DockerManager()
        self._output_filename = None

    def get_output_filename(self):
        return self._output_filename
    
    async def generate_visualization(
        self, 
        request: VisualizationRequest
    ) -> VisualizationResponse:
        script_path = None
        try:
            logger.info(f"Generating {request.visualization_type} visualization using {request.language}")
            
            # Create unique script filename
            script_id = uuid4().hex[:8]
            script_ext = ".py" if request.language == "python" else ".R"
            
            if request.visualization_type == "interactive":
                output_ext = ".html"
            else:
                output_ext = ".png"
                
            self._output_filename = f"output_{script_id}{output_ext}"

            settings.SCRIPTS_DIR.mkdir(exist_ok=True)
            settings.OUTPUTS_DIR.mkdir(exist_ok=True)
            
            if request.language == "python":
                savefig_pattern = r"plt\.savefig\(['\"]([^'\"]+)['\"]\)"
                savefig_matches = re.findall(savefig_pattern, request.code)
                
                if savefig_matches:
                    for match in savefig_matches:
                        request.code = request.code.replace(
                            f"plt.savefig('{match}')", 
                            f"plt.savefig('/outputs/{self._output_filename}')"
                        )
                        request.code = request.code.replace(
                            f'plt.savefig("{match}")', 
                            f'plt.savefig("/outputs/{self._output_filename}")'
                        )
                elif "plotly" in request.code and ".write_html" in request.code:
                    html_pattern = r"\.write_html\(['\"]([^'\"]+)['\"]\)"
                    html_matches = re.findall(html_pattern, request.code)
                    
                    for match in html_matches:
                        request.code = request.code.replace(
                            f".write_html('{match}')", 
                            f".write_html('/outputs/{self._output_filename}')"
                        )
                        request.code = request.code.replace(
                            f'.write_html("{match}")', 
                            f'.write_html("/outputs/{self._output_filename}")'
                        )
                else:
                    if "plt." in request.code and "plt.savefig" not in request.code:
                        request.code += f"\nplt.savefig('/outputs/{self._output_filename}')"
                    elif "plotly" in request.code and ".write_html" not in request.code:
                        request.code += f"\nfig.write_html('/outputs/{self._output_filename}')"
            
            elif request.language == "r":

                request.code = re.sub(r'\b(plot|print)\s*\((.*?)\)', '', request.code)
                
                if "ggplot(" in request.code and "ggsave" not in request.code:
                    lines = request.code.split('\n')
                    gg_var = None
                    modified_lines = []
                    
                    for line in lines:
                        if 'ggplot(' in line and ('<-' in line or '->' in line):
                            if '<-' in line:
                                gg_var = line.split('<-')[0].strip()
                            elif '->' in line:
                                gg_var = line.split('->')[1].strip()
                        modified_lines.append(line)
                        
                    request.code = '\n'.join(modified_lines)
                    
                    if gg_var and "ggsave" not in request.code:
                        request.code += f"\nggsave('/outputs/{self._output_filename}', {gg_var}, width=10, height=7, dpi=300)"
                    elif not gg_var:
                        lines = request.code.split("\n")
                        modified_lines = []
                        plot_started = False
                        plot_lines = []
                        
                        for line in lines:
                            if "ggplot(" in line:
                                plot_started = True
                                plot_lines.append(line)
                            elif plot_started and (line.strip().startswith("+") or line.strip() == ""):
                                plot_lines.append(line)
                            else:
                                modified_lines.append(line)
                        
                        if plot_lines:
                            plot_code = "\n".join(plot_lines)
                            modified_lines.append(f"p <- {plot_code}")
                            
                        request.code = "\n".join(modified_lines)
                    
                        request.code += f"\nggsave('/outputs/{self._output_filename}', width=10, height=7, dpi=300)"

                elif "ggsave" in request.code:
                    request.code = re.sub(
                        r"ggsave\s*\(\s*['\"]([^'\"]+)['\"]\s*,", 
                        f"ggsave('/outputs/{self._output_filename}',", 
                        request.code
                    )

            logger.info(f"Output will be saved as: {self._output_filename}")

            script_path = Path(settings.SCRIPTS_DIR) / f"script_{script_id}{script_ext}"
            script_path.write_text(request.code)
            logger.info(f"Created script file: {script_path}")
            
            success, logs = await self.docker_manager.execute_script(script_path, request.language)
            
            return success, logs
            
        except Exception as e:
            logger.error(f"Visualization generation failed: {str(e)}")
            return False, str(e)
        finally:
            if script_path and script_path.exists():
                try:
                    script_path.unlink()
                    logger.info(f"Deleted temporary script file: {script_path}")
                except Exception as e:
                    logger.error(f"Failed to delete script file: {str(e)}")