
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const MatrixRain: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let fontSize = 16;
      let columns: number;
      let streams: Stream[] = [];

      class Char {
        value: string = '';
        x: number;
        y: number;
        speed: number;
        first: boolean;
        opacity: number;
        isLocked: boolean = false;

        constructor(x: number, y: number, speed: number, first: boolean, opacity: number) {
          this.x = x;
          this.y = y;
          this.speed = speed;
          this.first = first;
          this.opacity = opacity;
          this.setToRandomChar();
        }

        setToRandomChar() {
          if (!this.isLocked) {
            const charType = p.round(p.random(0, 5));
            if (charType > 1) {
              this.value = String.fromCharCode(0x30A0 + p.round(p.random(0, 96)));
            } else {
              this.value = String.fromCharCode(0x0030 + p.round(p.random(0, 10)));
            }
          }
        }

        rain() {
          this.y = (this.y >= p.height) ? 0 : this.y + this.speed;
        }
      }

      class Stream {
        chars: Char[] = [];
        totalChars: number;
        speed: number;

        constructor(x: number) {
          this.totalChars = p.round(p.random(8, 30));
          this.speed = p.random(2, 5);
          let y = p.random(-1000, 0);

          for (let i = 0; i <= this.totalChars; i++) {
            const char = new Char(x, y, this.speed, i === 0, 255 - (i / this.totalChars) * 255);
            this.chars.push(char);
            y -= fontSize;
          }
        }

        render() {
          this.chars.forEach((char) => {
            if (char.first) {
              p.fill(220, 255, 230, char.opacity * opacity);
            } else {
              p.fill(16, 185, 129, char.opacity * opacity);
            }

            p.text(char.value, char.x, char.y);
            char.rain();
            char.setToRandomChar();
          });
        }
      }

      p.setup = () => {
        const canvas = p.createCanvas(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
        canvas.style('position', 'absolute');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '0');
        canvas.style('pointer-events', 'none');
        
        p.textFont('JetBrains Mono');
        p.textSize(fontSize);
        
        columns = p.width / fontSize;
        for (let i = 0; i < columns; i++) {
          streams.push(new Stream(i * fontSize));
        }
      };

      p.draw = () => {
        p.background(2, 6, 23, 40);
        streams.forEach(stream => stream.render());
      };

      p.windowResized = () => {
        if (!containerRef.current) return;
        p.resizeCanvas(containerRef.current.clientWidth, containerRef.current.clientHeight);
        columns = p.width / fontSize;
        streams = [];
        for (let i = 0; i < columns; i++) {
          streams.push(new Stream(i * fontSize));
        }
      };
    };

    // Robust instantiation for ESM environments
    const P5Constructor = (p5 as any).default || p5;
    let myP5: any;
    try {
      myP5 = new P5Constructor(sketch, containerRef.current);
    } catch (e) {
      console.error("P5_INIT_FAULT: Failed to instantiate p5 constructor.", e);
    }

    return () => {
      if (myP5) myP5.remove();
    };
  }, [opacity]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />;
};

export default MatrixRain;
