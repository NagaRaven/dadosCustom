export const STATUSES = [
  'Activa',
  'Extinta',
  'En decadencia',
  'Aliada del Imperio',
  'Rebelde',
  'Neutral',
];

export const CHAR_STATES = ['Vivo', 'Muerto', 'Desaparecido', 'Prisionero', 'Exiliado'];

export const STATUS_STYLE = {
  'Activa':             { color: '#c9a227', border: 'rgba(201,162,39,0.6)',  bg: 'rgba(201,162,39,0.08)',  glow: '0 0 10px rgba(201,162,39,0.4)' },
  'Extinta':            { color: '#777777', border: 'rgba(119,119,119,0.4)', bg: 'rgba(119,119,119,0.05)', glow: 'none' },
  'En decadencia':      { color: '#cc5500', border: 'rgba(204,85,0,0.5)',    bg: 'rgba(204,85,0,0.08)',    glow: '0 0 10px rgba(204,85,0,0.3)' },
  'Aliada del Imperio': { color: '#cc2020', border: 'rgba(204,32,32,0.5)',   bg: 'rgba(204,32,32,0.08)',   glow: '0 0 10px rgba(204,32,32,0.4)' },
  'Rebelde':            { color: '#22aa44', border: 'rgba(34,170,68,0.4)',   bg: 'rgba(34,170,68,0.06)',   glow: '0 0 10px rgba(34,170,68,0.3)' },
  'Neutral':            { color: '#5588aa', border: 'rgba(85,136,170,0.4)', bg: 'rgba(85,136,170,0.06)',  glow: 'none' },
};

export const CHAR_STATE_COLOR = {
  'Vivo':        '#22aa44',
  'Muerto':      '#666666',
  'Desaparecido':'#cc8800',
  'Prisionero':  '#cc2020',
  'Exiliado':    '#5588aa',
};
