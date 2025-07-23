from manim import *
import numpy as np

class GradientVanishingExploding(Scene):
    def construct(self):
        # Title
        title = Text("RNN Gradient Limitations", font_size=48, color=BLUE)
        title.to_edge(UP, buff=0.5)
        
        self.play(Write(title))
        self.wait(1)
        
        # Clear title for main animation
        self.play(FadeOut(title))
        
        # Show gradient vanishing problem first
        self.show_vanishing_problem()
        
        # Transition to exploding problem
        self.show_exploding_problem()
    
    def show_vanishing_problem(self):
        """Show gradient vanishing problem"""
        
        # Problem title
        problem_title = Text("Gradient Vanishing Problem", font_size=36, color=RED)
        problem_title.shift(UP * 3)
        
        self.play(Write(problem_title))
        self.wait(1)
        
        # Setup RNN architecture
        self.setup_rnn_architecture("vanishing")
        
        # Show weight value
        weight_text = Text("Weight W = 0.3 (< 1)", font_size=20, color=RED)
        weight_text.shift(UP * 0.5)
        self.play(Write(weight_text))
        self.wait(1)
        
        # Demonstrate backpropagation
        self.demonstrate_backpropagation("vanishing")
        
        # Show gradient values
        self.show_gradient_values("vanishing")
        
        # Show the limitation
        limitation_text = Text("Gradients → 0", font_size=24, color=RED)
        limitation_text.shift(DOWN * 3.5)
        self.play(Write(limitation_text))
        self.wait(1)
        
        # Clear all objects before showing loss curve
        self.play(
            FadeOut(self.rnn_states),
            FadeOut(self.rnn_arrows),
            FadeOut(self.grad_arrows),
            FadeOut(self.gradient_bars),
            FadeOut(self.axis_label),
            FadeOut(limitation_text),
            FadeOut(weight_text)
        )
        
        # Show loss curve with local minima problem
        self.show_loss_curve("vanishing")
        self.wait(2)
        
        # Clear everything for next problem
        self.play(
            FadeOut(problem_title),
            FadeOut(self.loss_curve_elements)
        )
        self.wait(1)
    
    def show_exploding_problem(self):
        """Show gradient exploding problem"""
        
        # Problem title
        problem_title = Text("Gradient Exploding Problem", font_size=36, color=YELLOW)
        problem_title.shift(UP * 3)
        
        self.play(Write(problem_title))
        self.wait(1)
        
        # Setup RNN architecture
        self.setup_rnn_architecture("exploding")
        
        # Show weight value
        weight_text = Text("Weight W = 3.0 (> 1)", font_size=20, color=YELLOW)
        weight_text.shift(UP * 0.5)
        self.play(Write(weight_text))
        self.wait(1)
        
        # Demonstrate backpropagation
        self.demonstrate_backpropagation("exploding")
        
        # Show gradient values
        self.show_gradient_values("exploding")
        
        # Show the limitation
        limitation_text = Text("Gradients → ∞", font_size=24, color=YELLOW)
        limitation_text.shift(DOWN * 3)
        self.play(Write(limitation_text))
        self.wait(1)
        
        # Clear all objects before showing loss curve
        self.play(
            FadeOut(self.rnn_states),
            FadeOut(self.rnn_arrows),
            FadeOut(self.grad_arrows),
            FadeOut(self.gradient_bars),
            FadeOut(self.axis_label),
            FadeOut(limitation_text),
            FadeOut(weight_text)
        )
        
        # Show loss curve with overshooting problem
        self.show_loss_curve("exploding")
        self.wait(2)
        
        # Final fadeout
        self.play(
            FadeOut(problem_title),
            FadeOut(self.loss_curve_elements)
        )
    
    def setup_rnn_architecture(self, problem_type):
        """Setup RNN architecture for the current problem"""
        
        self.sequence_length = 5
        
        # Choose colors based on problem type
        if problem_type == "vanishing":
            state_color = BLUE
            arrow_color = BLUE
        else:  # exploding
            state_color = ORANGE
            arrow_color = ORANGE
        
        # Create RNN states (centered)
        self.rnn_states = VGroup()
        for i in range(self.sequence_length):
            circle = Circle(radius=0.4, color=state_color, fill_opacity=0.5)
            h_label = Text(f"h{i+1}", font_size=14, color=WHITE)
            state = VGroup(circle, h_label)
            # Center the sequence horizontally
            start_x = -(self.sequence_length - 1) * 0.9 / 2
            state.shift(RIGHT * (start_x + i * 0.9) + DOWN * 0.5)
            self.rnn_states.add(state)
        
        # Create connections between states
        self.rnn_arrows = VGroup()
        for i in range(1, self.sequence_length):
            arrow = Arrow(
                self.rnn_states[i-1].get_right(),
                self.rnn_states[i].get_left(),
                color=arrow_color,
                stroke_width=3,
                buff=0.1
            )
            self.rnn_arrows.add(arrow)
        
        # Show the architecture
        self.play(
            LaggedStart(
                *[Create(state) for state in self.rnn_states],
                lag_ratio=0.15
            )
        )
        
        self.play(Create(self.rnn_arrows))
        self.wait(1)
    
    def demonstrate_backpropagation(self, problem_type):
        """Show gradients flowing backward through time"""
        
        # Choose colors based on problem type
        if problem_type == "vanishing":
            grad_color = RED
        else:  # exploding
            grad_color = YELLOW
        
        # Create gradient flow arrows (backward direction)
        self.grad_arrows = VGroup()
        
        for i in range(self.sequence_length - 1, 0, -1):
            arrow = Arrow(
                self.rnn_states[i].get_left() + UP * 0.3,
                self.rnn_states[i-1].get_right() + UP * 0.3,
                color=grad_color,
                stroke_width=4,
                buff=0.1
            )
            self.grad_arrows.add(arrow)
        
        # Add backpropagation label
        backprop_label = Text("Backpropagation Through Time", font_size=18, color=GREEN)
        backprop_label.shift(DOWN * 1.8)
        
        self.play(Write(backprop_label))
        
        # Animate gradient flow step by step
        for i in range(len(self.grad_arrows)):
            self.play(Create(self.grad_arrows[i]), run_time=0.6)
            self.wait(0.2)
        
        self.play(FadeOut(backprop_label))
        self.wait(1)
    
    def show_gradient_values(self, problem_type):
        """Show gradient magnitude bars"""
        
        # Choose values and colors based on problem type
        if problem_type == "vanishing":
            values = [1.0, 0.3, 0.09, 0.027, 0.008]
            color = RED
        else:  # exploding
            values = [1.0, 3.0, 9.0, 27.0, 81.0]
            # Normalize for better visualization
            max_val = max(values)
            values = [min(v/max_val * 3, 3) for v in [1.0, 3.0, 9.0, 27.0, 81.0]]
            color = YELLOW
        
        # Create gradient magnitude bars (centered)
        self.gradient_bars = VGroup()
        start_x = -(self.sequence_length - 1) * 0.9 / 2
        
        for i, value in enumerate(values):
            if problem_type == "vanishing":
                bar_height = value * 1.2
            else:
                bar_height = value * 0.4
                
            bar = Rectangle(
                width=0.4,
                height=bar_height,
                color=color,
                fill_opacity=0.7
            )
            bar.shift(RIGHT * (start_x + i * 0.9) + DOWN * 2.2 + UP * bar_height/2)
            
            # Add value label
            if problem_type == "vanishing":
                value_label = Text(f"{[1.0, 0.3, 0.09, 0.027, 0.008][i]:.3f}", font_size=10, color=WHITE)
            else:
                value_label = Text(f"{[1.0, 3.0, 9.0, 27.0, 81.0][i]:.0f}", font_size=10, color=WHITE)
            value_label.next_to(bar, DOWN, buff=0.1)
            
            bar_group = VGroup(bar, value_label)
            self.gradient_bars.add(bar_group)
        
        # Add axis label
        self.axis_label = Text("Gradient Magnitude", font_size=16, color=WHITE)
        self.axis_label.shift(DOWN * 3.2)
        
        self.play(
            LaggedStart(
                *[Create(bar) for bar in self.gradient_bars],
                Write(self.axis_label),
                lag_ratio=0.1
            )
        )
        
        # Animate pulsing effect for emphasis
        for _ in range(2):
            self.play(
                *[bar[0].animate.set_fill(opacity=0.3) for bar in self.gradient_bars],
                run_time=0.5
            )
            self.play(
                *[bar[0].animate.set_fill(opacity=0.7) for bar in self.gradient_bars],
                run_time=0.5
            )
        
        self.wait(1)

    def show_loss_curve(self, problem_type):
        """Show loss curve demonstrating optimization problems"""
        
        # Create axes for the loss curve (centered)
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[0, 4, 1],
            x_length=6,
            y_length=3.5,
            axis_config={"color": WHITE, "stroke_width": 2},
            tips=False
        )
        axes.shift(DOWN * 0.5)  # Center vertically
        
        # Create axis labels
        x_label = Text("Parameters", font_size=14, color=WHITE)
        x_label.next_to(axes.x_axis, DOWN, buff=0.3)
        
        y_label = Text("Loss", font_size=14, color=WHITE)
        y_label.next_to(axes.y_axis, LEFT, buff=0.3)
        y_label.rotate(PI/2)
        
        if problem_type == "vanishing":
            # Create a loss curve with multiple local minima and steep regions
            # This function has a global minimum around x=1.2 and local minima around x=-1
            def loss_function(x):
                return 0.5 * (x + 1)**2 + 0.3 * np.sin(3*x) + 0.5
            
            curve = axes.plot(loss_function, color=BLUE, stroke_width=3)
            
            # Show optimization path getting stuck in local minima
            start_point = axes.coords_to_point(-2.5, loss_function(-2.5))
            local_minima = axes.coords_to_point(-1.7, loss_function(-1.7))
            global_minima = axes.coords_to_point(-0.7, loss_function(-0.7))  # Global minimum is at x=-1 for this function
            
            # Mark the points
            start_dot = Dot(start_point, color=RED, radius=0.08)
            local_dot = Dot(local_minima, color=ORANGE, radius=0.08)
            global_dot = Dot(global_minima, color=GREEN, radius=0.08)
            
            # Labels for points
            start_label = Text("Start", font_size=10, color=RED)
            start_label.next_to(start_dot, UP, buff=0.1)
            
            local_label = Text("Stuck!", font_size=10, color=ORANGE)
            local_label.next_to(local_dot, UP, buff=0.1)
            
            global_label = Text("Global Min", font_size=10, color=GREEN)
            global_label.next_to(global_dot, DOWN, buff=0.1)
            
            # Optimization path (stuck in local minima)
            path = VMobject()
            path.set_points_as_corners([
                start_point,
                axes.coords_to_point(-2.5, loss_function(-2.5)),
                axes.coords_to_point(-1.7, loss_function(-1.7)),
                local_minima
            ])
            path.set_color(RED)
            path.set_stroke(width=3)
            
            # Add gradient vectors to show vanishing gradients
            # Show small gradients near the local minimum
            grad_point1 = axes.coords_to_point(-0.9, loss_function(-0.9))
            grad_point2 = axes.coords_to_point(-1.1, loss_function(-1.1))
            
            # Very small gradient arrows
            grad_arrow1 = Arrow(
                grad_point1, 
                axes.coords_to_point(-0.85, loss_function(-0.9)), 
                color=YELLOW, 
                stroke_width=2,
                max_tip_length_to_length_ratio=0.3
            )
            grad_arrow2 = Arrow(
                grad_point2, 
                axes.coords_to_point(-1.15, loss_function(-1.1)), 
                color=YELLOW, 
                stroke_width=2,
                max_tip_length_to_length_ratio=0.3
            )
            
            problem_text = Text("Vanishing Gradients - Stuck in Local Minima", font_size=16, color=RED)
            problem_text.next_to(axes, DOWN, buff=0.5)

        else:  # exploding
            # Create a loss curve showing overshooting
            def loss_function(x):
                return 0.5 * x**2
            
            curve = axes.plot(loss_function, color=ORANGE, stroke_width=3)
            
            # Show optimization path overshooting the global minima
            start_point = axes.coords_to_point(-2, loss_function(-2))
            optimal_point = axes.coords_to_point(0, loss_function(0))
            overshoot1 = axes.coords_to_point(2, loss_function(2))
            overshoot2 = axes.coords_to_point(-2.5, loss_function(-2.5))
            
            # Mark the points
            start_dot = Dot(start_point, color=YELLOW, radius=0.08)
            optimal_dot = Dot(optimal_point, color=GREEN, radius=0.08)
            overshoot1_dot = Dot(overshoot1, color=RED, radius=0.08)
            overshoot2_dot = Dot(overshoot2, color=RED, radius=0.08)
            
            # Labels for points
            start_label = Text("Start", font_size=10, color=YELLOW)
            start_label.next_to(start_dot, UP, buff=0.1)
            
            optimal_label = Text("Global minima", font_size=10, color=GREEN)
            optimal_label.next_to(optimal_dot, DOWN, buff=0.1)
            
            overshoot_label = Text("Overshoot!", font_size=10, color=RED)
            overshoot_label.next_to(overshoot1_dot, UP, buff=0.1)
            
            # Oscillating path (jumping over optimal)
            path = VMobject()
            path.set_points_as_corners([
                start_point,
                overshoot1,
                overshoot2,
                axes.coords_to_point(2.2, loss_function(2.2))
            ])
            path.set_color(YELLOW)
            path.set_stroke(width=3)
            
            problem_text = Text("Jumps Over global minima", font_size=16, color=YELLOW)
            problem_text.next_to(axes, DOWN, buff=0.4)
        
        # Store all elements for later cleanup
        if problem_type == "vanishing":
            self.loss_curve_elements = VGroup(
                axes, x_label, y_label, curve, 
                start_dot, local_dot, global_dot,
                start_label, local_label, global_label,
                path, problem_text
            )
        else:
            self.loss_curve_elements = VGroup(
                axes, x_label, y_label, curve,
                start_dot, optimal_dot, overshoot1_dot, overshoot2_dot,
                start_label, optimal_label, overshoot_label,
                path, problem_text
            )
        
        # Animate the loss curve
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(curve))
        
        if problem_type == "vanishing":
            # Show vanishing gradient problem
            self.play(Create(start_dot), Write(start_label))
            self.wait(0.5)
            self.play(Create(path), run_time=2)
            self.play(Create(local_dot), Write(local_label))
            self.wait(0.5)
            self.play(Create(global_dot), Write(global_label))
            self.play(Write(problem_text))
        else:
            # Show exploding gradient problem
            self.play(Create(start_dot), Write(start_label))
            self.play(Create(optimal_dot), Write(optimal_label))
            self.wait(0.5)
            self.play(Create(path), run_time=2)
            self.play(
                Create(overshoot1_dot), 
                Create(overshoot2_dot), 
                Write(overshoot_label)
            )
            self.play(Write(problem_text))
        
        self.wait(1)

if __name__ == "__main__":
    # To render this animation, run:
    # manim -pql grad-van-exp.py GradientVanishingExploding
    pass
