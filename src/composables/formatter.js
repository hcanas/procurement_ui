export function useFormatter() {
  const formatDate = value => new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

  const formatDateTime = value => {
    return new Intl.DateTimeFormat('en-PH', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour12: true, 
      hour: 'numeric', 
      minute: 'numeric',
    }).format(new Date(value));
  };

  const formatCurrency = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

  return {
    formatDate,
    formatDateTime,
    formatCurrency,
  }
}