import { h } from '../../utils/dom.js';

/** options (apenas para type "select"): [{ value, label }] */
export function FormField({
  label,
  name,
  scope = 'form',
  type = 'text',
  required = true,
  options = [],
  hint,
  ...attributes
}) {
  const id = `${scope}-${name}`;
  const control =
    type === 'select'
      ? h(
          'select',
          { id, name, required },
          h('option', { value: '' }, 'Selecione'),
          ...options.map((option) => h('option', { value: option.value }, option.label)),
        )
      : h('input', { id, name, type, required, ...attributes });

  return h(
    'div',
    { class: 'field' },
    h('label', { for: id }, label),
    control,
    hint && h('small', { class: 'field__hint' }, hint),
  );
}

export const FormError = () => h('p', { class: 'form-error', role: 'alert', hidden: true });
