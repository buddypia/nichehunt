import * as React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  VisuallyHiddenProps
>(({ children, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : 'span';
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  };

  if (asChild) {
    return React.cloneElement(
      children as React.ReactElement,
      {
        style: {
          ...(children as React.ReactElement).props.style,
          ...style,
        },
      }
    );
  }

  return (
    <Comp ref={ref} style={style} {...props}>
      {children}
    </Comp>
  );
});

VisuallyHidden.displayName = 'VisuallyHidden';
