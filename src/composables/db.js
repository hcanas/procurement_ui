import axios from 'axios';

export function useDB() {
  const getRecord = (url, response, reject) => axios.get(url).then(response).catch(reject ?? (() => {}));
  const createRecord = (url, response, reject) => axios.post(url).then(response).catch(reject ?? (() => {}));
  const updateRecord = (url, response, reject) => axios.put(url).then(response).catch(reject ?? (() => {}));
  const deleteRecord = (url, response, reject) => axios.delete(url).then(response).catch(reject ?? (() => {}));

  return {
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
  }
}