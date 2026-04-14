import { render } from '@testing-library/react';
import { Board } from '../components/game/Board';

test('renders board', () => {
  render(<Board socket={null} />);
});