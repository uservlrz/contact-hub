export function describeError(error) {
  if (error?.details?.length) {
    return error.details.map((detail) => detail.message).join(' • ');
  }
  return error?.message || 'Erro inesperado';
}

/**
 * Liga um formulário a um handler assíncrono: bloqueia o botão durante o envio
 * e exibe no elemento de erro qualquer falha lançada pelo handler.
 */
export function bindForm(form, errorElement, handler, { resetOnSuccess = false } = {}) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    errorElement.hidden = true;
    submit.disabled = true;

    try {
      await handler(Object.fromEntries(new FormData(form)));
      if (resetOnSuccess) form.reset();
    } catch (error) {
      errorElement.textContent = describeError(error);
      errorElement.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
}
