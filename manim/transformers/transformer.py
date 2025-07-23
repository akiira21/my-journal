from manim import *
import numpy as np

class TransformerArchitecture(Scene):
    def construct(self):
        # Title (smaller and better positioned)
        title = Text("Transformer Architecture", font_size=36, color=BLUE)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title))
        self.wait(0.5)
        
        # Input and output text (smaller and better positioned)
        input_text = Text("English: I love you", font_size=18, color=GREEN)
        output_text = Text("French: Je t'aime", font_size=18, color=RED)
        
        input_text.to_edge(LEFT, buff=0.3).shift(UP * 2.5)
        output_text.to_edge(RIGHT, buff=0.3).shift(UP * 2.5)
        
        self.play(Write(input_text), Write(output_text))
        self.wait(1)
        
        # Create the main transformer architecture
        self.create_transformer_architecture()
        
        # Show the data flow
        self.show_data_flow()
        
        self.wait(3)
    
    def create_transformer_architecture(self):
        # Encoder side (scaled down and repositioned)
        encoder_title = Text("ENCODER", font_size=16, color=BLUE).shift(LEFT * 3 + UP * 2)
        
        # Input embeddings
        input_embed = RoundedRectangle(width=1.6, height=0.6, color=GREEN, fill_opacity=0.3)
        input_embed.shift(LEFT * 3 + UP * 1.2)
        input_embed_text = Text("Input\nEmbedding", font_size=10)
        input_embed_text.move_to(input_embed)
        
        # Positional encoding
        pos_encoding = RoundedRectangle(width=1.6, height=0.6, color=YELLOW, fill_opacity=0.3)
        pos_encoding.shift(LEFT * 3 + UP * 0.4)
        pos_encoding_text = Text("Positional\nEncoding", font_size=10)
        pos_encoding_text.move_to(pos_encoding)
        
        # Add operation
        add1 = Circle(radius=0.15, color=WHITE).shift(LEFT * 3 + DOWN * 0.2)
        add1_text = Text("+", font_size=12).move_to(add1)
        
        # Multi-Head Attention (Encoder)
        mha_enc = RoundedRectangle(width=2, height=0.8, color=PURPLE, fill_opacity=0.3)
        mha_enc.shift(LEFT * 3 + DOWN * 0.8)
        mha_enc_text = Text("Multi-Head\nAttention", font_size=10)
        mha_enc_text.move_to(mha_enc)
        
        # Add & Norm 1
        add_norm1 = RoundedRectangle(width=1.6, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm1.shift(LEFT * 3 + DOWN * 1.5)
        add_norm1_text = Text("Add & Norm", font_size=10)
        add_norm1_text.move_to(add_norm1)
        
        # Feed Forward
        ff_enc = RoundedRectangle(width=2, height=0.8, color=PINK, fill_opacity=0.3)
        ff_enc.shift(LEFT * 3 + DOWN * 2.2)
        ff_enc_text = Text("Feed Forward\nNetwork", font_size=10)
        ff_enc_text.move_to(ff_enc)
        
        # Add & Norm 2
        add_norm2 = RoundedRectangle(width=1.6, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm2.shift(LEFT * 3 + DOWN * 2.9)
        add_norm2_text = Text("Add & Norm", font_size=10)
        add_norm2_text.move_to(add_norm2)
        
        # Decoder side (scaled down and repositioned)
        decoder_title = Text("DECODER", font_size=16, color=RED).shift(RIGHT * 3 + UP * 2)
        
        # Output embeddings
        output_embed = RoundedRectangle(width=1.6, height=0.6, color=GREEN, fill_opacity=0.3)
        output_embed.shift(RIGHT * 3 + UP * 1.2)
        output_embed_text = Text("Output\nEmbedding", font_size=10)
        output_embed_text.move_to(output_embed)
        
        # Positional encoding (decoder)
        pos_encoding_dec = RoundedRectangle(width=1.6, height=0.6, color=YELLOW, fill_opacity=0.3)
        pos_encoding_dec.shift(RIGHT * 3 + UP * 0.4)
        pos_encoding_dec_text = Text("Positional\nEncoding", font_size=10)
        pos_encoding_dec_text.move_to(pos_encoding_dec)
        
        # Add operation (decoder)
        add2 = Circle(radius=0.15, color=WHITE).shift(RIGHT * 3 + DOWN * 0.2)
        add2_text = Text("+", font_size=12).move_to(add2)
        
        # Masked Multi-Head Attention
        masked_mha = RoundedRectangle(width=2, height=0.8, color=PURPLE, fill_opacity=0.3)
        masked_mha.shift(RIGHT * 3 + DOWN * 0.8)
        masked_mha_text = Text("Masked\nMulti-Head\nAttention", font_size=9)
        masked_mha_text.move_to(masked_mha)
        
        # Add & Norm 3
        add_norm3 = RoundedRectangle(width=1.6, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm3.shift(RIGHT * 3 + DOWN * 1.5)
        add_norm3_text = Text("Add & Norm", font_size=10)
        add_norm3_text.move_to(add_norm3)
        
        # Cross Attention
        cross_attn = RoundedRectangle(width=2, height=0.8, color=TEAL, fill_opacity=0.3)
        cross_attn.shift(RIGHT * 3 + DOWN * 2.2)
        cross_attn_text = Text("Multi-Head\nCross\nAttention", font_size=9)
        cross_attn_text.move_to(cross_attn)
        
        # Add & Norm 4
        add_norm4 = RoundedRectangle(width=1.6, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm4.shift(RIGHT * 3 + DOWN * 2.9)
        add_norm4_text = Text("Add & Norm", font_size=10)
        add_norm4_text.move_to(add_norm4)
        
        # Feed Forward (decoder)
        ff_dec = RoundedRectangle(width=2, height=0.8, color=PINK, fill_opacity=0.3)
        ff_dec.shift(RIGHT * 3 + DOWN * 3.6)
        ff_dec_text = Text("Feed Forward\nNetwork", font_size=10)
        ff_dec_text.move_to(ff_dec)
        
        # Add & Norm 5
        add_norm5 = RoundedRectangle(width=1.6, height=0.5, color=ORANGE, fill_opacity=0.3)
        add_norm5.shift(RIGHT * 3 + DOWN * 4.3)
        add_norm5_text = Text("Add & Norm", font_size=10)
        add_norm5_text.move_to(add_norm5)
        
        # Linear & Softmax
        linear_softmax = RoundedRectangle(width=2, height=0.8, color=GOLD, fill_opacity=0.3)
        linear_softmax.shift(RIGHT * 3 + DOWN * 5)
        linear_softmax_text = Text("Linear &\nSoftmax", font_size=10)
        linear_softmax_text.move_to(linear_softmax)
        
        # Create all encoder components
        encoder_components = VGroup(
            encoder_title, input_embed, input_embed_text, pos_encoding, pos_encoding_text,
            add1, add1_text, mha_enc, mha_enc_text, add_norm1, add_norm1_text,
            ff_enc, ff_enc_text, add_norm2, add_norm2_text
        )
        
        # Create all decoder components
        decoder_components = VGroup(
            decoder_title, output_embed, output_embed_text, pos_encoding_dec, pos_encoding_dec_text,
            add2, add2_text, masked_mha, masked_mha_text, add_norm3, add_norm3_text,
            cross_attn, cross_attn_text, add_norm4, add_norm4_text,
            ff_dec, ff_dec_text, add_norm5, add_norm5_text,
            linear_softmax, linear_softmax_text
        )
        
        # Animate encoder
        self.play(
            LaggedStart(
                *[Create(comp) for comp in encoder_components],
                lag_ratio=0.1
            ),
            run_time=3
        )
        
        # Animate decoder
        self.play(
            LaggedStart(
                *[Create(comp) for comp in decoder_components],
                lag_ratio=0.1
            ),
            run_time=3
        )
        
        # Store components for later use
        self.encoder_components = encoder_components
        self.decoder_components = decoder_components
        self.input_embed = input_embed
        self.add_norm2 = add_norm2
        self.cross_attn = cross_attn
        self.linear_softmax = linear_softmax
        
        # Create arrows for data flow
        self.create_arrows()
    
    def create_arrows(self):
        # Encoder arrows
        encoder_arrows = []
        
        # Input to embedding
        arrow1 = Arrow(
            start=self.input_embed.get_bottom(),
            end=self.input_embed.get_bottom() + DOWN * 0.3,
            color=WHITE, stroke_width=2
        )
        
        # Between encoder components (updated positions)
        positions = [
            (LEFT * 3 + UP * 0.4, LEFT * 3 + DOWN * 0.05),
            (LEFT * 3 + DOWN * 0.35, LEFT * 3 + DOWN * 0.55),
            (LEFT * 3 + DOWN * 1.05, LEFT * 3 + DOWN * 1.25),
            (LEFT * 3 + DOWN * 1.75, LEFT * 3 + DOWN * 1.95),
            (LEFT * 3 + DOWN * 2.45, LEFT * 3 + DOWN * 2.65)
        ]
        
        for start, end in positions:
            arrow = Arrow(start=start, end=end, color=WHITE, stroke_width=2)
            encoder_arrows.append(arrow)
        
        # Decoder arrows
        decoder_arrows = []
        
        # Between decoder components (updated positions)
        dec_positions = [
            (RIGHT * 3 + UP * 0.4, RIGHT * 3 + DOWN * 0.05),
            (RIGHT * 3 + DOWN * 0.35, RIGHT * 3 + DOWN * 0.55),
            (RIGHT * 3 + DOWN * 1.05, RIGHT * 3 + DOWN * 1.25),
            (RIGHT * 3 + DOWN * 1.75, RIGHT * 3 + DOWN * 1.95),
            (RIGHT * 3 + DOWN * 2.45, RIGHT * 3 + DOWN * 2.65),
            (RIGHT * 3 + DOWN * 3.15, RIGHT * 3 + DOWN * 3.35),
            (RIGHT * 3 + DOWN * 3.85, RIGHT * 3 + DOWN * 4.05),
            (RIGHT * 3 + DOWN * 4.55, RIGHT * 3 + DOWN * 4.75)
        ]
        
        for start, end in dec_positions:
            arrow = Arrow(start=start, end=end, color=WHITE, stroke_width=2)
            decoder_arrows.append(arrow)
        
        # Cross attention arrow (encoder to decoder) - updated positions
        cross_arrow = CurvedArrow(
            start_point=LEFT * 1.5 + DOWN * 2.9,
            end_point=RIGHT * 1.5 + DOWN * 2.2,
            color=YELLOW, stroke_width=3
        )
        
        # Draw all arrows
        self.play(
            *[Create(arrow) for arrow in encoder_arrows],
            *[Create(arrow) for arrow in decoder_arrows],
            Create(cross_arrow)
        )
        
        self.cross_arrow = cross_arrow
    
    def show_data_flow(self):
        # Create word tokens
        english_words = ["I", "love", "you"]
        french_words = ["Je", "t'", "aime"]
        
        # Create input tokens (repositioned)
        input_tokens = VGroup()
        for i, word in enumerate(english_words):
            token = RoundedRectangle(width=0.6, height=0.3, color=GREEN, fill_opacity=0.7)
            token.shift(LEFT * 5 + UP * 0.5 + RIGHT * i * 0.7)
            token_text = Text(word, font_size=12, color=BLACK)
            token_text.move_to(token)
            input_tokens.add(VGroup(token, token_text))
        
        # Create output tokens (repositioned)
        output_tokens = VGroup()
        for i, word in enumerate(french_words):
            token = RoundedRectangle(width=0.6, height=0.3, color=RED, fill_opacity=0.7)
            token.shift(RIGHT * 5 + UP * 0.5 + RIGHT * i * 0.7)
            token_text = Text(word, font_size=12, color=BLACK)
            token_text.move_to(token)
            output_tokens.add(VGroup(token, token_text))
        
        # Animate tokens appearing
        self.play(
            LaggedStart(
                *[FadeIn(token) for token in input_tokens],
                lag_ratio=0.3
            ),
            run_time=2
        )
        
        # Show processing through encoder
        processing_dot = Dot(color=YELLOW, radius=0.08)
        processing_dot.move_to(LEFT * 3 + UP * 1.2)
        
        self.play(Create(processing_dot))
        
        # Animate dot moving through encoder (updated positions)
        encoder_positions = [
            (LEFT * 3 + UP * 1.2, None),
            (LEFT * 3 + UP * 0.4, None),
            (LEFT * 3 + DOWN * 0.2, None),
            (LEFT * 3 + DOWN * 0.8, "mha"),
            (LEFT * 3 + DOWN * 1.5, None),
            (LEFT * 3 + DOWN * 2.2, "ff"),
            (LEFT * 3 + DOWN * 2.9, None)
        ]
        
        for pos, flash_type in encoder_positions[1:]:
            self.play(processing_dot.animate.move_to(pos), run_time=0.5)
            # Flash the current component
            if flash_type == "mha":  # Multi-head attention
                self.play(Flash(self.encoder_components[7], color=YELLOW), run_time=0.3)
            elif flash_type == "ff":  # Feed forward
                self.play(Flash(self.encoder_components[11], color=YELLOW), run_time=0.3)
        
        # Move to cross attention (updated position)
        self.play(
            processing_dot.animate.move_to(RIGHT * 3 + DOWN * 2.2),
            Flash(self.cross_arrow, color=YELLOW),
            run_time=1
        )
        
        # Animate through decoder (updated positions)
        decoder_positions = [
            (RIGHT * 3 + DOWN * 0.8, "masked_attn"),  # Masked attention
            (RIGHT * 3 + DOWN * 2.2, "cross_attn"),   # Cross attention
            (RIGHT * 3 + DOWN * 3.6, "ff"),           # Feed forward
            (RIGHT * 3 + DOWN * 5.0, "linear")        # Linear & Softmax
        ]
        
        for pos, flash_type in decoder_positions:
            self.play(processing_dot.animate.move_to(pos), run_time=0.5)
            if flash_type == "masked_attn":
                # Flash masked attention
                masked_mha_group = VGroup(self.decoder_components[7], self.decoder_components[8])
                self.play(Flash(masked_mha_group, color=YELLOW), run_time=0.3)
            elif flash_type == "cross_attn":
                # Flash cross attention
                cross_attn_group = VGroup(self.decoder_components[11], self.decoder_components[12])
                self.play(Flash(cross_attn_group, color=YELLOW), run_time=0.3)
            elif flash_type == "ff":
                # Flash feed forward
                ff_group = VGroup(self.decoder_components[15], self.decoder_components[16])
                self.play(Flash(ff_group, color=YELLOW), run_time=0.3)
            elif flash_type == "linear":
                # Flash linear & softmax
                linear_group = VGroup(self.decoder_components[19], self.decoder_components[20])
                self.play(Flash(linear_group, color=YELLOW), run_time=0.3)
        
        # Show output tokens appearing
        self.play(
            LaggedStart(
                *[FadeIn(token) for token in output_tokens],
                lag_ratio=0.3
            ),
            FadeOut(processing_dot),
            run_time=2
        )
        
        # Add attention visualization
        self.show_attention_pattern()
    
    def show_attention_pattern(self):
        # Create attention pattern visualization (repositioned and smaller)
        attention_title = Text("Attention Pattern", font_size=16, color=YELLOW)
        attention_title.shift(DOWN * 2.8)
        
        # Create a simplified attention matrix (smaller)
        matrix_size = 3
        attention_matrix = VGroup()
        
        for i in range(matrix_size):
            for j in range(matrix_size):
                # Simulate attention weights
                if (i == 0 and j == 0) or (i == 1 and j == 1) or (i == 2 and j == 2):
                    opacity = 0.8  # High self-attention
                elif (i == 1 and j == 0) or (i == 2 and j == 1):
                    opacity = 0.5  # Medium cross-attention
                else:
                    opacity = 0.2  # Low attention
                
                cell = Square(side_length=0.3, fill_opacity=opacity, color=YELLOW)
                cell.shift(DOWN * 2.8 + LEFT * 0.5 + RIGHT * j * 0.3 + DOWN * i * 0.3)
                attention_matrix.add(cell)
        
        # Labels (smaller)
        input_labels = VGroup()
        output_labels = VGroup()
        
        words = ["I", "love", "you"]
        for i, word in enumerate(words):
            input_label = Text(word, font_size=10)
            input_label.shift(DOWN * 2.8 + LEFT * 1.1 + DOWN * i * 0.3)
            input_labels.add(input_label)
            
            output_label = Text(word, font_size=10)
            output_label.shift(DOWN * 2.4 + LEFT * 0.5 + RIGHT * i * 0.3)
            output_labels.add(output_label)
        
        self.play(
            Write(attention_title),
            Create(attention_matrix),
            Write(input_labels),
            Write(output_labels)
        )
        
        # Highlight key attention connections (smaller)
        for i in range(3):
            highlight = Square(side_length=0.3, color=RED, stroke_width=3, fill_opacity=0)
            highlight.move_to(attention_matrix[i * 3 + i])
            self.play(Create(highlight), run_time=0.5)
            self.play(FadeOut(highlight), run_time=0.3)

if __name__ == "__main__":
    # To render the scene, run:
    # manim -pql transformer.py TransformerArchitecture
    pass
