import Cookies from 'js-cookie';

export function useGate() {
  const data = JSON.parse(Cookies.get('auth_permissions') ?? '[]');

  const hasPermission = (name, office_id) => {
    if (typeof name === 'string') {
      const permission = data.find(({ n }) => n === name);

      if (!permission || (office_id && !permission.o.includes(parseInt(office_id)))) return false;
      else return true;
    } else if (typeof name === 'object') {
      return Boolean(data.reduce((prev, next) => {
        if (name.includes(next.n) && (!office_id || next.o.includes(parseInt(office_id)))) prev++;
        return prev;
      }, 0));
    }
  };

  const getOffices = permission => {
    if (typeof permission === 'string') {
      return data.find(({ n }) => n === permission)?.o ?? [];
    } else if (typeof permission === 'object') {
      let offices = [];

      permission.forEach(x =>offices = [
        ...offices,
        ...(data.find(({ n }) => n === x)?.o ?? [])
      ]);

      // return unique offices
      return offices.reduce((prev, next) => {
        if (!prev.includes(next)) prev.push(next);
    
        return prev;
      }, []);
    }
  };
  
  return {
    hasPermission,
    getOffices,
  }
}