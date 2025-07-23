from manim import *
import numpy as np

class RNNSequentialComputation(Scene):
    def construct(self):
        # Title
        title = Text("Recurrent Neural Network (RNN)", font_size=48, color=BLUE)
        subtitle = Text("Sequential Processing Limitation", font_size=32, color=RED)
        title.to_edge(UP, buff=0.5)
        subtitle.next_to(title, DOWN, buff=0.3)
        
        self.play(Write(title))
        self.play(Write(subtitle))
        self.wait(1)
        
        # Clear title for main animation
        self.play(FadeOut(title), FadeOut(subtitle))
        
        # Setup the RNN architecture
        self.setup_rnn_architecture()
        
        # Show sequential computation
        self.demonstrate_sequential_processing()
        
        # Show the complete sequence
        self.show_complete_sequence()
    
    def setup_rnn_architecture(self):
        """Setup the basic RNN architecture components"""
        
        # Input sequence (we'll show 4 time steps)
        self.sequence_length = 4
        self.input_texts = ["Hello", "how", "are", "you"]
        
        # Create input boxes (centered and lower)
        self.input_boxes = VGroup()
        for i, text in enumerate(self.input_texts):
            box = Rectangle(width=1.5, height=0.8, color=GREEN, fill_opacity=0.3)
            label = Text(text, font_size=24)
            input_item = VGroup(box, label)
            input_item.shift(LEFT * 3 + RIGHT * i * 2 + DOWN * 1)  # Moved down
            self.input_boxes.add(input_item)
        
        # Create time step labels
        self.time_labels = VGroup()
        for i in range(self.sequence_length):
            time_label = Text(f"t={i+1}", font_size=20, color=YELLOW)
            time_label.next_to(self.input_boxes[i], DOWN, buff=0.3)
            self.time_labels.add(time_label)
        
        # Hidden states (centered and lower)
        self.hidden_states = VGroup()
        for i in range(self.sequence_length):
            circle = Circle(radius=0.5, color=BLUE, fill_opacity=0.5)
            h_label = Text(f"h{i+1}", font_size=20, color=WHITE)
            hidden_state = VGroup(circle, h_label)
            hidden_state.shift(LEFT * 3 + RIGHT * i * 2 + UP * 0.5)  # Moved down
            self.hidden_states.add(hidden_state)
        
        # Output states (centered and lower)
        self.outputs = VGroup()
        for i in range(self.sequence_length):
            box = Rectangle(width=1.2, height=0.6, color=RED, fill_opacity=0.3)
            y_label = Text(f"y{i+1}", font_size=20, color=WHITE)
            output = VGroup(box, y_label)
            output.shift(LEFT * 3 + RIGHT * i * 2 + UP * 2)  # Moved down
            self.outputs.add(output)
        
        # Weight matrices (as text labels only)
        self.W_xh_label = Text("Wxh", font_size=18, color=PURPLE)
        self.W_xh_label.shift(LEFT * 4.5 + DOWN * 0.25)
        
        self.W_hh_label = Text("Whh", font_size=18, color=ORANGE)
        self.W_hh_label.shift(LEFT * 2.0 + UP * 0.5)
        
        self.W_hy_label = Text("Why", font_size=18, color=PINK)
        self.W_hy_label.shift(LEFT * 4.5 + UP * 1.25)
        
        # Show the architecture
        self.play(
            LaggedStart(
                *[Create(box) for box in self.input_boxes],
                *[Write(label) for label in self.time_labels],
                lag_ratio=0.2
            )
        )
        self.wait(0.5)
        
        self.play(
            LaggedStart(
                *[Create(state) for state in self.hidden_states],
                lag_ratio=0.2
            )
        )
        self.wait(0.5)
        
        self.play(
            LaggedStart(
                *[Create(output) for output in self.outputs],
                lag_ratio=0.2
            )
        )
        self.wait(0.5)
        
        # Show weight matrices
        self.play(
            Write(self.W_xh_label),
            Write(self.W_hh_label),
            Write(self.W_hy_label)
        )
        self.wait(1)
    
    def demonstrate_sequential_processing(self):
        """Demonstrate the sequential processing step by step"""
        
        # Initial hidden state (h0) - positioned relative to lowered architecture
        h0 = Circle(radius=0.3, color=GRAY, fill_opacity=0.3)
        h0_label = Text("h0", font_size=16, color=WHITE)
        h0_group = VGroup(h0, h0_label)
        h0_group.shift(LEFT * 5 + UP * 0.5)  # Moved down
        
        self.play(Create(h0_group))
        self.wait(0.5)
        
        # Process each time step
        for t in range(self.sequence_length):
            self.process_time_step(t, h0_group if t == 0 else None)
            self.wait(1)
    
    def process_time_step(self, t, prev_h=None):
        """Process a single time step"""
        
        # Highlight current input
        current_input = self.input_boxes[t]
        self.play(current_input.animate.set_color(YELLOW), run_time=0.5)
        
        # Show data flow arrows
        arrows = VGroup()
        
        # Arrow from input to hidden state (through Wxh)
        if t == 0:
            input_to_hidden = Arrow(
                current_input.get_top(),
                self.hidden_states[t].get_bottom(),
                color=GREEN,
                stroke_width=4
            )
        else:
            input_to_hidden = Arrow(
                current_input.get_top(),
                self.hidden_states[t].get_bottom(),
                color=GREEN,
                stroke_width=4
            )
        
        arrows.add(input_to_hidden)
        
        # Arrow from previous hidden state (if not first time step)
        if t > 0:
            prev_to_current = Arrow(
                self.hidden_states[t-1].get_right(),
                self.hidden_states[t].get_left(),
                color=BLUE,
                stroke_width=4
            )
            arrows.add(prev_to_current)
        
        # Arrow from hidden to output
        hidden_to_output = Arrow(
            self.hidden_states[t].get_top(),
            self.outputs[t].get_bottom(),
            color=RED,
            stroke_width=4
        )
        arrows.add(hidden_to_output)
        
        # Show computation formula
        if t == 0:
            formula = Text(
                f"h1 = tanh(Wxh × x1 + Whh × h0)",
                font_size=24,
                color=WHITE
            )
        else:
            formula = Text(
                f"h{t+1} = tanh(Wxh × x{t+1} + Whh × h{t})",
                font_size=24,
                color=WHITE
            )
        
        formula.to_edge(DOWN, buff=1)
        
        output_formula = Text(
            f"y{t+1} = Why × h{t+1}",
            font_size=24,
            color=RED
        )
        output_formula.next_to(formula, UP, buff=0.3)
        
        # Animate the computation
        self.play(Create(arrows))
        self.play(Write(formula))
        
        # Highlight the current hidden state
        self.play(
            self.hidden_states[t].animate.set_color(YELLOW),
            run_time=0.5
        )
        
        # Show output computation
        self.play(Write(output_formula))
        self.play(
            self.outputs[t].animate.set_color(YELLOW),
            run_time=0.5
        )
        
        self.wait(1.5)  # Wait to show the formulas
        
        # Clean up for next step
        self.play(
            FadeOut(arrows),
            FadeOut(formula),
            FadeOut(output_formula),
            current_input.animate.set_color(GREEN),
            self.hidden_states[t].animate.set_color(BLUE),
            self.outputs[t].animate.set_color(RED)
        )
    
    def show_complete_sequence(self):
        """Show the complete sequence processing"""
        
        # Create a summary view
        summary_title = Text("Sequential Processing: The Problem", font_size=36, color=RED)
        summary_title.to_edge(UP, buff=0.5)
        
        self.play(Write(summary_title))
        
        # Show all arrows at once
        all_arrows = VGroup()
        
        # Input to hidden arrows
        for t in range(self.sequence_length):
            arrow = Arrow(
                self.input_boxes[t].get_top(),
                self.hidden_states[t].get_bottom(),
                color=GREEN,
                stroke_width=3
            )
            all_arrows.add(arrow)
        
        # Hidden to hidden arrows (recurrent connections)
        for t in range(1, self.sequence_length):
            arrow = Arrow(
                self.hidden_states[t-1].get_right(),
                self.hidden_states[t].get_left(),
                color=BLUE,
                stroke_width=3
            )
            all_arrows.add(arrow)
        
        # Hidden to output arrows
        for t in range(self.sequence_length):
            arrow = Arrow(
                self.hidden_states[t].get_top(),
                self.outputs[t].get_bottom(),
                color=RED,
                stroke_width=3
            )
            all_arrows.add(arrow)
        
        # Animate all connections
        self.play(Create(all_arrows), run_time=2)
        
        # Show information flow with color wave
        self.animate_information_flow()
        
        self.wait(2)  # Wait to observe the sequential nature
        
        # Clean up
        self.play(
            FadeOut(summary_title),
            FadeOut(all_arrows)
        )
    
    def animate_information_flow(self):
        """Animate information flowing through the network"""
        
        for cycle in range(2):
            # Flow through inputs
            for t in range(self.sequence_length):
                self.play(
                    self.input_boxes[t].animate.set_color(YELLOW),
                    run_time=0.3
                )
                self.play(
                    self.hidden_states[t].animate.set_color(YELLOW),
                    run_time=0.3
                )
                self.play(
                    self.outputs[t].animate.set_color(YELLOW),
                    run_time=0.3
                )
            
            # Reset colors
            self.play(
                *[box.animate.set_color(GREEN) for box in self.input_boxes],
                *[state.animate.set_color(BLUE) for state in self.hidden_states],
                *[output.animate.set_color(RED) for output in self.outputs],
                run_time=0.5
            )

if __name__ == "__main__":
    # To render this animation, run:
    # manim -pql main.py RNNSequentialComputation
    pass
