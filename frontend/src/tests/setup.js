import '@testing-library/jest-dom';

// jsdom no implementa scrollIntoView — lo mockeamos para los tests
window.HTMLElement.prototype.scrollIntoView = () => {};
