const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const dayFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

export const formatDateTime = (iso) => dateTimeFormat.format(new Date(iso));

/** Recebe "YYYY-MM-DD" e evita deslocamento de fuso ao formatar. */
export const formatDay = (isoDay) => dayFormat.format(new Date(`${isoDay}T12:00:00`));
