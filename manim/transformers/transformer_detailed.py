from manim import *
import numpy as np

class DetailedTransformerFlow(Scene):
    def construct(self):
        # Title
        title = Text("Transformer: I love you → Je t'aime", font_size=36, color=BLUE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        
        # Create the detailed flow
        self.create_detailed_architecture()
        self.show_token_processing()
        
        self.wait(3)
    
    def create_detailed_architecture(self):
        # Input tokens with embeddings visualization
        input_section = self.create_input_section()
        
        # Central transformer blocks
        encoder_block = self.create_encoder_block()
        decoder_block = self.create_decoder_block()
        
        # Output section
        output_section = self.create_output_section()
        
        # Arrange components
        input_section.shift(LEFT * 5)
        encoder_block.shift(LEFT * 1.5)
        decoder_block.shift(RIGHT * 1.5)
        output_section.shift(RIGHT * 5)
        
        # Animate creation
        self.play(Create(input_section), run_time=2)
        self.play(Create(encoder_block), run_time=2)
        self.play(Create(decoder_block), run_time=2)
        self.play(Create(output_section), run_time=2)
        
        # Store for later reference
        self.input_section = input_section
        self.encoder_block = encoder_block
        self.decoder_block = decoder_block
        self.output_section = output_section
    
    def create_input_section(self):
        input_group = VGroup()
        
        # Title
        title = Text("Input Processing", font_size=16, color=GREEN)
        title.shift(UP * 2.5)
        input_group.add(title)
        
        # Tokens
        tokens = ["I", "love", "you"]
        token_boxes = VGroup()
        
        for i, token in enumerate(tokens):
            box = RoundedRectangle(width=0.8, height=0.5, color=GREEN, fill_opacity=0.3)
            box.shift(UP * (1.5 - i * 0.8))
            text = Text(token, font_size=14)
            text.move_to(box)
            token_boxes.add(VGroup(box, text))
        
        input_group.add(token_boxes)
        
        # Embedding arrow
        embed_arrow = Arrow(
            start=UP * 0.3,
            end=DOWN * 0.3,
            color=YELLOW,
            stroke_width=3
        )
        input_group.add(embed_arrow)
        
        # Embedding vectors (represented as matrices)
        embed_matrices = VGroup()
        for i in range(3):
            matrix = VGroup()
            for row in range(3):
                for col in range(4):
                    cell = Square(side_length=0.08, color=BLUE, fill_opacity=0.5)
                    cell.shift(DOWN * (0.7 + i * 0.8) + LEFT * 0.12 + RIGHT * col * 0.08 + UP * row * 0.08)
                    matrix.add(cell)
            embed_matrices.add(matrix)
        
        input_group.add(embed_matrices)
        
        return input_group
    
    def create_encoder_block(self):
        encoder_group = VGroup()
        
        # Title
        title = Text("Encoder Layer", font_size=16, color=PURPLE)
        title.shift(UP * 2.5)
        encoder_group.add(title)
        
        # Multi-Head Attention
        mha_box = RoundedRectangle(width=2.5, height=1.2, color=PURPLE, fill_opacity=0.3)
        mha_box.shift(UP * 1.5)
        mha_text = Text("Multi-Head\nSelf-Attention", font_size=12)
        mha_text.move_to(mha_box)
        encoder_group.add(VGroup(mha_box, mha_text))
        
        # Add & Norm
        add_norm1 = RoundedRectangle(width=2, height=0.6, color=ORANGE, fill_opacity=0.3)
        add_norm1.shift(UP * 0.5)
        add_norm1_text = Text("Add & Norm", font_size=12)
        add_norm1_text.move_to(add_norm1)
        encoder_group.add(VGroup(add_norm1, add_norm1_text))
        
        # Feed Forward
        ff_box = RoundedRectangle(width=2.5, height=1, color=PINK, fill_opacity=0.3)
        ff_box.shift(DOWN * 0.5)
        ff_text = Text("Feed Forward\nNetwork", font_size=12)
        ff_text.move_to(ff_box)
        encoder_group.add(VGroup(ff_box, ff_text))
        
        # Add & Norm 2
        add_norm2 = RoundedRectangle(width=2, height=0.6, color=ORANGE, fill_opacity=0.3)
        add_norm2.shift(DOWN * 1.5)
        add_norm2_text = Text("Add & Norm", font_size=12)
        add_norm2_text.move_to(add_norm2)
        encoder_group.add(VGroup(add_norm2, add_norm2_text))
        
        # Arrows
        arrows = VGroup()
        for y in [0.9, -0.1, -1.1]:
            arrow = Arrow(start=UP * (y + 0.2), end=UP * (y - 0.2), color=WHITE, stroke_width=2)
            arrows.add(arrow)
        encoder_group.add(arrows)
        
        return encoder_group
    
    def create_decoder_block(self):
        decoder_group = VGroup()
        
        # Title
        title = Text("Decoder Layer", font_size=16, color=RED)
        title.shift(UP * 2.5)
        decoder_group.add(title)
        
        # Masked Multi-Head Attention
        masked_mha = RoundedRectangle(width=2.5, height=1, color=PURPLE, fill_opacity=0.3)
        masked_mha.shift(UP * 1.8)
        masked_mha_text = Text("Masked\nSelf-Attention", font_size=11)
        masked_mha_text.move_to(masked_mha)
        decoder_group.add(VGroup(masked_mha, masked_mha_text))
        
        # Add & Norm
        add_norm1 = RoundedRectangle(width=2, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm1.shift(UP * 1)
        add_norm1_text = Text("Add & Norm", font_size=11)
        add_norm1_text.move_to(add_norm1)
        decoder_group.add(VGroup(add_norm1, add_norm1_text))
        
        # Cross Attention
        cross_attn = RoundedRectangle(width=2.5, height=1, color=TEAL, fill_opacity=0.3)
        cross_attn.shift(UP * 0.2)
        cross_attn_text = Text("Cross\nAttention", font_size=11)
        cross_attn_text.move_to(cross_attn)
        decoder_group.add(VGroup(cross_attn, cross_attn_text))
        
        # Add & Norm 2
        add_norm2 = RoundedRectangle(width=2, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm2.shift(DOWN * 0.6)
        add_norm2_text = Text("Add & Norm", font_size=11)
        add_norm2_text.move_to(add_norm2)
        decoder_group.add(VGroup(add_norm2, add_norm2_text))
        
        # Feed Forward
        ff_box = RoundedRectangle(width=2.5, height=1, color=PINK, fill_opacity=0.3)
        ff_box.shift(DOWN * 1.4)
        ff_text = Text("Feed Forward\nNetwork", font_size=11)
        ff_text.move_to(ff_box)
        decoder_group.add(VGroup(ff_box, ff_text))
        
        # Add & Norm 3
        add_norm3 = RoundedRectangle(width=2, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm3.shift(DOWN * 2.2)
        add_norm3_text = Text("Add & Norm", font_size=11)
        add_norm3_text.move_to(add_norm3)
        decoder_group.add(VGroup(add_norm3, add_norm3_text))
        
        # Arrows
        arrows = VGroup()
        for y in [1.3, 0.5, -0.3, -1.1, -1.9]:
            arrow = Arrow(start=UP * (y + 0.15), end=UP * (y - 0.15), color=WHITE, stroke_width=2)
            arrows.add(arrow)
        decoder_group.add(arrows)
        
        return decoder_group
    
    def create_output_section(self):
        output_group = VGroup()
        
        # Title
        title = Text("Output Generation", font_size=16, color=RED)
        title.shift(UP * 2.5)
        output_group.add(title)
        
        # Linear layer
        linear_box = RoundedRectangle(width=2, height=0.8, color=GOLD, fill_opacity=0.3)
        linear_box.shift(UP * 1.5)
        linear_text = Text("Linear", font_size=12)
        linear_text.move_to(linear_box)
        output_group.add(VGroup(linear_box, linear_text))
        
        # Softmax
        softmax_box = RoundedRectangle(width=2, height=0.8, color=GOLD, fill_opacity=0.3)
        softmax_box.shift(UP * 0.5)
        softmax_text = Text("Softmax", font_size=12)
        softmax_text.move_to(softmax_box)
        output_group.add(VGroup(softmax_box, softmax_text))
        
        # Output tokens
        french_tokens = ["Je", "t'", "aime"]
        token_boxes = VGroup()
        
        for i, token in enumerate(french_tokens):
            box = RoundedRectangle(width=0.8, height=0.5, color=RED, fill_opacity=0.3)
            box.shift(DOWN * (0.5 + i * 0.8))
            text = Text(token, font_size=14)
            text.move_to(box)
            token_boxes.add(VGroup(box, text))
        
        output_group.add(token_boxes)
        
        # Arrows
        arrows = VGroup()
        arrow1 = Arrow(start=UP * 1.1, end=UP * 0.9, color=WHITE, stroke_width=2)
        arrow2 = Arrow(start=UP * 0.1, end=DOWN * 0.1, color=WHITE, stroke_width=2)
        arrows.add(arrow1, arrow2)
        output_group.add(arrows)
        
        return output_group
    
    def show_token_processing(self):
        # Create processing indicators
        self.wait(1)
        
        # Show attention patterns
        self.show_attention_visualization()
        
        # Show cross attention
        self.show_cross_attention()
        
        # Show final output generation
        self.show_output_generation()
    
    def show_attention_visualization(self):
        # Create attention pattern for "I love you"
        attention_title = Text("Self-Attention Pattern", font_size=18, color=YELLOW)
        attention_title.shift(DOWN * 3.5)
        
        # Create attention matrix
        matrix = VGroup()
        words = ["I", "love", "you"]
        
        # Attention weights (simplified)
        weights = [
            [0.8, 0.1, 0.1],  # "I" attends mostly to itself
            [0.2, 0.6, 0.2],  # "love" attends to all words
            [0.1, 0.3, 0.6]   # "you" attends mostly to "love" and itself
        ]
        
        for i in range(3):
            for j in range(3):
                cell = Square(side_length=0.4, fill_opacity=weights[i][j], color=YELLOW)
                cell.shift(DOWN * 3.5 + LEFT * 0.5 + RIGHT * j * 0.4 + DOWN * i * 0.4)
                matrix.add(cell)
        
        # Labels
        row_labels = VGroup()
        col_labels = VGroup()
        
        for i, word in enumerate(words):
            row_label = Text(word, font_size=12)
            row_label.shift(DOWN * 3.5 + LEFT * 1.3 + DOWN * i * 0.4)
            row_labels.add(row_label)
            
            col_label = Text(word, font_size=12)
            col_label.shift(DOWN * 3.1 + LEFT * 0.5 + RIGHT * i * 0.4)
            col_labels.add(col_label)
        
        self.play(
            Write(attention_title),
            Create(matrix),
            Write(row_labels),
            Write(col_labels),
            run_time=2
        )
        
        self.wait(2)
        self.play(FadeOut(VGroup(attention_title, matrix, row_labels, col_labels)))
    
    def show_cross_attention(self):
        # Create curved arrow from encoder to decoder
        cross_arrow = CurvedArrow(
            start_point=LEFT * 0.25 + DOWN * 1.5,
            end_point=RIGHT * 0.25 + UP * 0.2,
            color=YELLOW,
            stroke_width=4
        )
        
        cross_label = Text("Cross Attention", font_size=14, color=YELLOW)
        cross_label.shift(UP * 0.5)
        
        self.play(
            Create(cross_arrow),
            Write(cross_label),
            run_time=2
        )
        
        # Highlight cross attention in decoder
        cross_box = self.decoder_block[3][0]  # Cross attention box
        self.play(Flash(cross_box, color=YELLOW, flash_radius=0.3), run_time=1)
        
        self.wait(1)
        self.play(FadeOut(VGroup(cross_arrow, cross_label)))
    
    def show_output_generation(self):
        # Create probability distributions
        prob_title = Text("Output Probabilities", font_size=16, color=GOLD)
        prob_title.shift(DOWN * 3.2)
        
        # Show probability bars for each French word
        french_words = ["Je", "t'", "aime"]
        prob_values = [0.95, 0.88, 0.92]  # High confidence
        
        prob_bars = VGroup()
        for i, (word, prob) in enumerate(zip(french_words, prob_values)):
            # Word label
            word_label = Text(word, font_size=14)
            word_label.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5)
            
            # Probability bar
            bar_bg = Rectangle(width=1, height=0.3, color=GRAY, fill_opacity=0.3)
            bar_bg.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5 + DOWN * 0.5)
            
            bar_fill = Rectangle(width=prob, height=0.3, color=GREEN, fill_opacity=0.8)
            bar_fill.align_to(bar_bg, LEFT)
            bar_fill.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5 + DOWN * 0.5)
            
            # Probability text
            prob_text = Text(f"{prob:.2f}", font_size=10)
            prob_text.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5 + DOWN * 0.8)
            
            prob_bars.add(VGroup(word_label, bar_bg, bar_fill, prob_text))
        
        self.play(
            Write(prob_title),
            LaggedStart(*[Create(bar_group) for bar_group in prob_bars], lag_ratio=0.3),
            run_time=3
        )
        
        self.wait(2)

if __name__ == "__main__":
    # To render both scenes, run:
    # manim -pql transformer_detailed.py DetailedTransformerFlow
    pass
import numpy as np

class DetailedTransformerFlow(Scene):
    def construct(self):
        # Title
        title = Text("Transformer: I love you → Je t'aime", font_size=36, color=BLUE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        
        # Create the detailed flow
        self.create_detailed_architecture()
        self.show_token_processing()
        
        self.wait(3)
    
    def create_detailed_architecture(self):
        # Input tokens with embeddings visualization
        input_section = self.create_input_section()
        
        # Central transformer blocks
        encoder_block = self.create_encoder_block()
        decoder_block = self.create_decoder_block()
        
        # Output section
        output_section = self.create_output_section()
        
        # Arrange components
        input_section.shift(LEFT * 5)
        encoder_block.shift(LEFT * 1.5)
        decoder_block.shift(RIGHT * 1.5)
        output_section.shift(RIGHT * 5)
        
        # Animate creation
        self.play(Create(input_section), run_time=2)
        self.play(Create(encoder_block), run_time=2)
        self.play(Create(decoder_block), run_time=2)
        self.play(Create(output_section), run_time=2)
        
        # Store for later reference
        self.input_section = input_section
        self.encoder_block = encoder_block
        self.decoder_block = decoder_block
        self.output_section = output_section
    
    def create_input_section(self):
        input_group = VGroup()
        
        # Title
        title = Text("Input Processing", font_size=16, color=GREEN)
        title.shift(UP * 2.5)
        input_group.add(title)
        
        # Tokens
        tokens = ["I", "love", "you"]
        token_boxes = VGroup()
        
        for i, token in enumerate(tokens):
            box = RoundedRectangle(width=0.8, height=0.5, color=GREEN, fill_opacity=0.3)
            box.shift(UP * (1.5 - i * 0.8))
            text = Text(token, font_size=14)
            text.move_to(box)
            token_boxes.add(VGroup(box, text))
        
        input_group.add(token_boxes)
        
        # Embedding arrow
        embed_arrow = Arrow(
            start=UP * 0.3,
            end=DOWN * 0.3,
            color=YELLOW,
            stroke_width=3
        )
        input_group.add(embed_arrow)
        
        # Embedding vectors (represented as matrices)
        embed_matrices = VGroup()
        for i in range(3):
            matrix = VGroup()
            for row in range(3):
                for col in range(4):
                    cell = Square(side_length=0.08, color=BLUE, fill_opacity=0.5)
                    cell.shift(DOWN * (0.7 + i * 0.8) + LEFT * 0.12 + RIGHT * col * 0.08 + UP * row * 0.08)
                    matrix.add(cell)
            embed_matrices.add(matrix)
        
        input_group.add(embed_matrices)
        
        return input_group
    
    def create_encoder_block(self):
        encoder_group = VGroup()
        
        # Title
        title = Text("Encoder Layer", font_size=16, color=PURPLE)
        title.shift(UP * 2.5)
        encoder_group.add(title)
        
        # Multi-Head Attention
        mha_box = RoundedRectangle(width=2.5, height=1.2, color=PURPLE, fill_opacity=0.3)
        mha_box.shift(UP * 1.5)
        mha_text = Text("Multi-Head\nSelf-Attention", font_size=12)
        mha_text.move_to(mha_box)
        encoder_group.add(VGroup(mha_box, mha_text))
        
        # Add & Norm
        add_norm1 = RoundedRectangle(width=2, height=0.6, color=ORANGE, fill_opacity=0.3)
        add_norm1.shift(UP * 0.5)
        add_norm1_text = Text("Add & Norm", font_size=12)
        add_norm1_text.move_to(add_norm1)
        encoder_group.add(VGroup(add_norm1, add_norm1_text))
        
        # Feed Forward
        ff_box = RoundedRectangle(width=2.5, height=1, color=PINK, fill_opacity=0.3)
        ff_box.shift(DOWN * 0.5)
        ff_text = Text("Feed Forward\nNetwork", font_size=12)
        ff_text.move_to(ff_box)
        encoder_group.add(VGroup(ff_box, ff_text))
        
        # Add & Norm 2
        add_norm2 = RoundedRectangle(width=2, height=0.6, color=ORANGE, fill_opacity=0.3)
        add_norm2.shift(DOWN * 1.5)
        add_norm2_text = Text("Add & Norm", font_size=12)
        add_norm2_text.move_to(add_norm2)
        encoder_group.add(VGroup(add_norm2, add_norm2_text))
        
        # Arrows
        arrows = VGroup()
        for y in [0.9, -0.1, -1.1]:
            arrow = Arrow(start=UP * (y + 0.2), end=UP * (y - 0.2), color=WHITE, stroke_width=2)
            arrows.add(arrow)
        encoder_group.add(arrows)
        
        return encoder_group
    
    def create_decoder_block(self):
        decoder_group = VGroup()
        
        # Title
        title = Text("Decoder Layer", font_size=16, color=RED)
        title.shift(UP * 2.5)
        decoder_group.add(title)
        
        # Masked Multi-Head Attention
        masked_mha = RoundedRectangle(width=2.5, height=1, color=PURPLE, fill_opacity=0.3)
        masked_mha.shift(UP * 1.8)
        masked_mha_text = Text("Masked\nSelf-Attention", font_size=11)
        masked_mha_text.move_to(masked_mha)
        decoder_group.add(VGroup(masked_mha, masked_mha_text))
        
        # Add & Norm
        add_norm1 = RoundedRectangle(width=2, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm1.shift(UP * 1)
        add_norm1_text = Text("Add & Norm", font_size=11)
        add_norm1_text.move_to(add_norm1)
        decoder_group.add(VGroup(add_norm1, add_norm1_text))
        
        # Cross Attention
        cross_attn = RoundedRectangle(width=2.5, height=1, color=TEAL, fill_opacity=0.3)
        cross_attn.shift(UP * 0.2)
        cross_attn_text = Text("Cross\nAttention", font_size=11)
        cross_attn_text.move_to(cross_attn)
        decoder_group.add(VGroup(cross_attn, cross_attn_text))
        
        # Add & Norm 2
        add_norm2 = RoundedRectangle(width=2, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm2.shift(DOWN * 0.6)
        add_norm2_text = Text("Add & Norm", font_size=11)
        add_norm2_text.move_to(add_norm2)
        decoder_group.add(VGroup(add_norm2, add_norm2_text))
        
        # Feed Forward
        ff_box = RoundedRectangle(width=2.5, height=1, color=PINK, fill_opacity=0.3)
        ff_box.shift(DOWN * 1.4)
        ff_text = Text("Feed Forward\nNetwork", font_size=11)
        ff_text.move_to(ff_box)
        decoder_group.add(VGroup(ff_box, ff_text))
        
        # Add & Norm 3
        add_norm3 = RoundedRectangle(width=2, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm3.shift(DOWN * 2.2)
        add_norm3_text = Text("Add & Norm", font_size=11)
        add_norm3_text.move_to(add_norm3)
        decoder_group.add(VGroup(add_norm3, add_norm3_text))
        
        # Arrows
        arrows = VGroup()
        for y in [1.3, 0.5, -0.3, -1.1, -1.9]:
            arrow = Arrow(start=UP * (y + 0.15), end=UP * (y - 0.15), color=WHITE, stroke_width=2)
            arrows.add(arrow)
        decoder_group.add(arrows)
        
        return decoder_group
    
    def create_output_section(self):
        output_group = VGroup()
        
        # Title
        title = Text("Output Generation", font_size=16, color=RED)
        title.shift(UP * 2.5)
        output_group.add(title)
        
        # Linear layer
        linear_box = RoundedRectangle(width=2, height=0.8, color=GOLD, fill_opacity=0.3)
        linear_box.shift(UP * 1.5)
        linear_text = Text("Linear", font_size=12)
        linear_text.move_to(linear_box)
        output_group.add(VGroup(linear_box, linear_text))
        
        # Softmax
        softmax_box = RoundedRectangle(width=2, height=0.8, color=GOLD, fill_opacity=0.3)
        softmax_box.shift(UP * 0.5)
        softmax_text = Text("Softmax", font_size=12)
        softmax_text.move_to(softmax_box)
        output_group.add(VGroup(softmax_box, softmax_text))
        
        # Output tokens
        french_tokens = ["Je", "t'", "aime"]
        token_boxes = VGroup()
        
        for i, token in enumerate(french_tokens):
            box = RoundedRectangle(width=0.8, height=0.5, color=RED, fill_opacity=0.3)
            box.shift(DOWN * (0.5 + i * 0.8))
            text = Text(token, font_size=14)
            text.move_to(box)
            token_boxes.add(VGroup(box, text))
        
        output_group.add(token_boxes)
        
        # Arrows
        arrows = VGroup()
        arrow1 = Arrow(start=UP * 1.1, end=UP * 0.9, color=WHITE, stroke_width=2)
        arrow2 = Arrow(start=UP * 0.1, end=DOWN * 0.1, color=WHITE, stroke_width=2)
        arrows.add(arrow1, arrow2)
        output_group.add(arrows)
        
        return output_group
    
    def show_token_processing(self):
        # Create processing indicators
        self.wait(1)
        
        # Show attention patterns
        self.show_attention_visualization()
        
        # Show cross attention
        self.show_cross_attention()
        
        # Show final output generation
        self.show_output_generation()
    
    def show_attention_visualization(self):
        # Create attention pattern for "I love you"
        attention_title = Text("Self-Attention Pattern", font_size=18, color=YELLOW)
        attention_title.shift(DOWN * 3.5)
        
        # Create attention matrix
        matrix = VGroup()
        words = ["I", "love", "you"]
        
        # Attention weights (simplified)
        weights = [
            [0.8, 0.1, 0.1],  # "I" attends mostly to itself
            [0.2, 0.6, 0.2],  # "love" attends to all words
            [0.1, 0.3, 0.6]   # "you" attends mostly to "love" and itself
        ]
        
        for i in range(3):
            for j in range(3):
                cell = Square(side_length=0.4, fill_opacity=weights[i][j], color=YELLOW)
                cell.shift(DOWN * 3.5 + LEFT * 0.5 + RIGHT * j * 0.4 + DOWN * i * 0.4)
                matrix.add(cell)
        
        # Labels
        row_labels = VGroup()
        col_labels = VGroup()
        
        for i, word in enumerate(words):
            row_label = Text(word, font_size=12)
            row_label.shift(DOWN * 3.5 + LEFT * 1.3 + DOWN * i * 0.4)
            row_labels.add(row_label)
            
            col_label = Text(word, font_size=12)
            col_label.shift(DOWN * 3.1 + LEFT * 0.5 + RIGHT * i * 0.4)
            col_labels.add(col_label)
        
        self.play(
            Write(attention_title),
            Create(matrix),
            Write(row_labels),
            Write(col_labels),
            run_time=2
        )
        
        self.wait(2)
        self.play(FadeOut(VGroup(attention_title, matrix, row_labels, col_labels)))
    
    def show_cross_attention(self):
        # Create curved arrow from encoder to decoder
        cross_arrow = CurvedArrow(
            start_point=LEFT * 0.25 + DOWN * 1.5,
            end_point=RIGHT * 0.25 + UP * 0.2,
            color=YELLOW,
            stroke_width=4
        )
        
        cross_label = Text("Cross Attention", font_size=14, color=YELLOW)
        cross_label.shift(UP * 0.5)
        
        self.play(
            Create(cross_arrow),
            Write(cross_label),
            run_time=2
        )
        
        # Highlight cross attention in decoder
        cross_box = self.decoder_block[3][0]  # Cross attention box
        self.play(Flash(cross_box, color=YELLOW, flash_radius=0.3), run_time=1)
        
        self.wait(1)
        self.play(FadeOut(VGroup(cross_arrow, cross_label)))
    
    def show_output_generation(self):
        # Create probability distributions
        prob_title = Text("Output Probabilities", font_size=16, color=GOLD)
        prob_title.shift(DOWN * 3.2)
        
        # Show probability bars for each French word
        french_words = ["Je", "t'", "aime"]
        prob_values = [0.95, 0.88, 0.92]  # High confidence
        
        prob_bars = VGroup()
        for i, (word, prob) in enumerate(zip(french_words, prob_values)):
            # Word label
            word_label = Text(word, font_size=14)
            word_label.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5)
            
            # Probability bar
            bar_bg = Rectangle(width=1, height=0.3, color=GRAY, fill_opacity=0.3)
            bar_bg.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5 + DOWN * 0.5)
            
            bar_fill = Rectangle(width=prob, height=0.3, color=GREEN, fill_opacity=0.8)
            bar_fill.align_to(bar_bg, LEFT)
            bar_fill.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5 + DOWN * 0.5)
            
            # Probability text
            prob_text = Text(f"{prob:.2f}", font_size=10)
            prob_text.shift(DOWN * 3.8 + LEFT * 1 + RIGHT * i * 1.5 + DOWN * 0.8)
            
            prob_bars.add(VGroup(word_label, bar_bg, bar_fill, prob_text))
        
        self.play(
            Write(prob_title),
            LaggedStart(*[Create(bar_group) for bar_group in prob_bars], lag_ratio=0.3),
            run_time=3
        )
        
        self.wait(2)

if __name__ == "__main__":
    # To render both scenes, run:
    # manim -pql transformer_detailed.py DetailedTransformerFlow
    pass


