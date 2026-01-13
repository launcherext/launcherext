import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const StarField: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr("width", width).attr("height", height);

    // Clear previous
    svg.selectAll("*").remove();

    const starCount = 200;
    const stars = d3.range(starCount).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.5 + 0.1
    }));

    svg.selectAll("circle")
      .data(stars)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", "#ffffff")
      .attr("opacity", d => d.opacity);

    const animate = () => {
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      });

      svg.selectAll("circle")
        .attr("cy", d => (d as any).y)
        .attr("cx", d => (d as any).x); // Update x slightly to re-randomize if needed
        
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleResize = () => {
        svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default StarField;