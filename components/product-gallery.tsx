"use client";

import { useState } from "react";
import Image from "next/image";
import { skincareKit } from "@/lib/product";

const slides = [
  { src: skincareKit.image, alt: skincareKit.imageAlt, label: "The complete kit", width: 1024, height: 1536 },
  ...skincareKit.steps.map((step) => ({
    src: step.image,
    alt: `${step.number} ${step.name} capsule (${step.product})`,
    label: `${step.number} ${step.name}`,
    width: 600,
    height: 600,
  })),
];

export function ProductGallery() {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  return (
    <div className="product-gallery">
      <div className="details-image-wrap product-gallery-main">
        <Image key={slide.src} src={slide.src} alt={slide.alt} width={slide.width} height={slide.height} priority={active === 0} />
        <p className="product-gallery-caption" aria-live="polite">{slide.label}</p>
      </div>
      <div className="product-gallery-thumbs" role="group" aria-label="Product images">
        {slides.map((item, index) => (
          <button
            key={item.src}
            type="button"
            className={index === active ? "is-active" : undefined}
            aria-label={`Show ${item.label}`}
            aria-pressed={index === active}
            onClick={() => setActive(index)}
          >
            <Image src={item.src} alt="" width={120} height={120} />
          </button>
        ))}
      </div>
    </div>
  );
}
