import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RollHistory from '../components/RollHistory';

const makeRoll = (username, result, id = Date.now()) => ({
  id,
  username,
  result,
  timestamp: new Date().toISOString(),
});

describe('RollHistory', () => {
  it('muestra mensaje cuando el historial está vacío', () => {
    render(<RollHistory history={[]} currentUser="Nivare" />);
    expect(screen.getByTestId('empty-history')).toBeInTheDocument();
  });

  it('renderiza las entradas del historial', () => {
    const history = [
      makeRoll('Nivare', 18, 1),
      makeRoll('Master', 3,  2),
      makeRoll('Kang',   15, 3),
    ];
    render(<RollHistory history={history} currentUser="Nivare" />);
    const entries = screen.getAllByTestId('roll-entry');
    expect(entries).toHaveLength(3);
  });

  it('muestra el nombre del usuario en cada entrada', () => {
    const history = [makeRoll('Xalithra', 12, 1), makeRoll('Mireya', 7, 2)];
    render(<RollHistory history={history} currentUser="Xalithra" />);
    expect(screen.getByText('Xalithra')).toBeInTheDocument();
    expect(screen.getByText('Mireya')).toBeInTheDocument();
  });

  it('muestra los resultados de cada tirada', () => {
    const history = [makeRoll('Nivare', 18, 1)];
    render(<RollHistory history={history} currentUser="Nivare" />);
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('etiqueta un 20 como CRÍTICO', () => {
    const history = [makeRoll('Master', 20, 1)];
    render(<RollHistory history={history} currentUser="Master" />);
    expect(screen.getByText('CRÍTICO')).toBeInTheDocument();
  });

  it('etiqueta un 1 como PIFIA', () => {
    const history = [makeRoll('Kang', 1, 1)];
    render(<RollHistory history={history} currentUser="Kang" />);
    expect(screen.getByText('PIFIA')).toBeInTheDocument();
  });

  it('muestra las entradas cuando el historial tiene tiradas', () => {
    const history = [makeRoll('Nivare', 10, 1), makeRoll('Luz-Ya', 5, 2)];
    render(<RollHistory history={history} currentUser="Nivare" />);
    expect(screen.getAllByTestId('roll-entry')).toHaveLength(2);
  });
});
