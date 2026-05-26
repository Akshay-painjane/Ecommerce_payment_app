import { useRef, useState } from "react";

function HorizontalScroller({ children, className = "" }) {
  const scrollerRef = useRef(null);
  const dragState = useRef({ dragging: false, moved: false, startX: 0, scrollLeft: 0 });
  const [dragging, setDragging] = useState(false);

  const scrollByPage = (direction) => {
    const node = scrollerRef.current;

    if (!node) {
      return;
    }

    node.scrollBy({
      left: direction * Math.max(280, node.clientWidth * 0.82),
      behavior: "smooth",
    });
  };

  const onPointerDown = (event) => {
    const node = scrollerRef.current;

    if (!node) {
      return;
    }

    dragState.current = {
      dragging: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: node.scrollLeft,
    };
    setDragging(true);
    node.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const node = scrollerRef.current;

    if (!node || !dragState.current.dragging) {
      return;
    }

    const delta = event.clientX - dragState.current.startX;

    if (Math.abs(delta) > 6) {
      dragState.current.moved = true;
    }

    node.scrollLeft = dragState.current.scrollLeft - delta;
  };

  const stopDrag = () => {
    dragState.current.dragging = false;
    setDragging(false);
  };

  const onClickCapture = (event) => {
    if (event.target.closest("button")) {
      dragState.current.moved = false;
      return;
    }

    if (dragState.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragState.current.moved = false;
    }
  };

  return (
    <div className={`horizontal-shell ${className}`}>
      <button className="scroll-arrow scroll-arrow-left" onClick={() => scrollByPage(-1)} type="button" aria-label="Scroll left">{"<"}</button>
      <div
        className={`horizontal-scroller${dragging ? " dragging" : ""}`}
        onClickCapture={onClickCapture}
        onPointerCancel={stopDrag}
        onPointerDown={onPointerDown}
        onPointerLeave={stopDrag}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        ref={scrollerRef}
      >
        {children}
      </div>
      <button className="scroll-arrow scroll-arrow-right" onClick={() => scrollByPage(1)} type="button" aria-label="Scroll right">{">"}</button>
    </div>
  );
}

export default HorizontalScroller;
