import { Language, VisualizationType } from "@/types";

type ExampleCode = {
  [key in Language]: {
    [key in VisualizationType]?: string;
  };
};

export const visualizationExamples: ExampleCode = {
  python: {
    static: `import matplotlib.pyplot as plt
import numpy as np

# Generate data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create the plot
plt.figure(figsize=(8, 6))
plt.plot(x, y, color='blue', linewidth=2)
plt.title('Sine Wave')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True, alpha=0.3)

# Add a horizontal line at y=0
plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)

# Save the plot - the backend will handle the output path
plt.savefig('output.png')`,

    interactive: `import plotly.graph_objects as go
import numpy as np
from plotly.subplots import make_subplots

# Generate sample data
np.random.seed(42)
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
temperatures = np.random.normal(20, 5, 12)  # Mean temp of 20°C with some variation
rainfall = np.random.normal(50, 20, 12)     # Mean rainfall of 50mm
humidity = np.random.normal(60, 10, 12)     # Mean humidity of 60%

# Create figure with secondary y-axis
fig = make_subplots(specs=[[{"secondary_y": True}]])

# Add temperature line
fig.add_trace(
    go.Scatter(
        x=months,
        y=temperatures,
        name="Temperature (°C)",
        line=dict(color="red", width=3),
        hovertemplate="Temperature: %{y:.1f}°C<br>Month: %{x}<extra></extra>"
    ),
    secondary_y=False,
)

# Add rainfall bars
fig.add_trace(
    go.Bar(
        x=months,
        y=rainfall,
        name="Rainfall (mm)",
        marker_color="royalblue",
        opacity=0.7,
        hovertemplate="Rainfall: %{y:.1f}mm<br>Month: %{x}<extra></extra>"
    ),
    secondary_y=True,
)

# Add humidity scatter points
fig.add_trace(
    go.Scatter(
        x=months,
        y=humidity,
        name="Humidity (%)",
        mode="markers",
        marker=dict(
            size=12,
            color="green",
            symbol="diamond",
            line=dict(color="darkgreen", width=2)
        ),
        hovertemplate="Humidity: %{y:.1f}%<br>Month: %{x}<extra></extra>"
    ),
    secondary_y=False,
)

# Customize layout
fig.update_layout(
    title="Interactive Weather Dashboard",
    title_x=0.5,
    plot_bgcolor="white",
    hoverlabel=dict(bgcolor="white"),
    legend=dict(
        yanchor="top",
        y=0.99,
        xanchor="left",
        x=0.01,
        bgcolor="rgba(255, 255, 255, 0.8)"
    ),
    hovermode="x unified"
)

# Update axes
fig.update_xaxes(
    title_text="Month",
    gridcolor="lightgray",
    showline=True,
    linewidth=2,
    linecolor="gray",
    mirror=True
)

fig.update_yaxes(
    title_text="Temperature (°C) / Humidity (%)",
    gridcolor="lightgray",
    showline=True,
    linewidth=2,
    linecolor="gray",
    mirror=True,
    secondary_y=False
)

fig.update_yaxes(
    title_text="Rainfall (mm)",
    gridcolor="lightgray",
    showline=True,
    linewidth=2,
    linecolor="gray",
    mirror=True,
    secondary_y=True
)

# Add buttons for different data views
fig.update_layout(
    updatemenus=[
        dict(
            type="buttons",
            direction="right",
            x=0.7,
            y=1.2,
            showactive=True,
            buttons=[
                dict(
                    label="All Data",
                    method="update",
                    args=[{"visible": [True, True, True]}]
                ),
                dict(
                    label="Temperature Only",
                    method="update",
                    args=[{"visible": [True, False, False]}]
                ),
                dict(
                    label="Rainfall Only",
                    method="update",
                    args=[{"visible": [False, True, False]}]
                ),
                dict(
                    label="Humidity Only",
                    method="update",
                    args=[{"visible": [False, False, True]}]
                )
            ]
        )
    ]
)

# Save as HTML - the backend will handle the output path
fig.write_html('output.html')`,
  },
  
  r: {
    static: `library(ggplot2)

# Create data
x <- seq(0, 10, length.out = 100)
y <- sin(x)
data <- data.frame(x = x, y = y)

# Create plot
p <- ggplot(data, aes(x = x, y = y)) +
  geom_line(color = "blue", size = 1) +
  labs(
    title = "Sine Wave",
    x = "x",
    y = "sin(x)"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5),
    panel.grid.minor = element_blank()
  )

# Save the plot - the backend will handle the output path
ggsave("output.png", p, width = 8, height = 6, dpi = 300)`,

    interactive: ` `,
  }
};


export const getExampleCode = (
  language: Language,
  type: VisualizationType
): string => {

  const example = visualizationExamples[language][type];
  
  if (!example) {
    return visualizationExamples[language].static || '';
  }
  
  return example;
};