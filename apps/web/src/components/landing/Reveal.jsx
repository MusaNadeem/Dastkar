// Thin wrapper that fades + lifts its children into view once. Motion band 4-7 = fluid CSS
// (skill §7), so the transition itself lives in CSS; this only toggles the class.
import { useInView } from '../../hooks/useInView.js';

export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
