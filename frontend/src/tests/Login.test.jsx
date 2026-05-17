import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('Login', () => {
  it('renderiza el formulario correctamente', () => {
    render(<Login onLogin={vi.fn()} />);
    expect(screen.getByTestId('username-select')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('muestra todos los usuarios en el selector', () => {
    render(<Login onLogin={vi.fn()} />);
    const select = screen.getByTestId('username-select');
    const options = Array.from(select.options).map((o) => o.value).filter(Boolean);
    expect(options).toEqual(['Master', 'Nivare', 'Xalithra', 'Luz-Ya', 'Mireya', 'Kang']);
  });

  it('muestra error si se envía sin seleccionar usuario', async () => {
    render(<Login onLogin={vi.fn()} />);
    fireEvent.click(screen.getByTestId('login-button'));
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  it('llama a onLogin cuando las credenciales son correctas', async () => {
    const onLogin = vi.fn();
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true, username: 'Master' }),
    });

    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByTestId('username-select'), { target: { value: 'Master' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'Nx7@kP2m' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('Master');
    });
  });

  it('muestra error cuando las credenciales son incorrectas', async () => {
    const onLogin = vi.fn();
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false, message: 'Credenciales incorrectas' }),
    });

    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByTestId('username-select'), { target: { value: 'Master' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'mal' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(onLogin).not.toHaveBeenCalled();
    });
  });

  it('muestra error cuando el servidor no responde', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Login onLogin={vi.fn()} />);

    fireEvent.change(screen.getByTestId('username-select'), { target: { value: 'Nivare' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'algo' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });
});
