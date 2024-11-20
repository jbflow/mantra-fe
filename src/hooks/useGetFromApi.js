import { get } from "aws-amplify/api";
import { fetchAuthSession } from 'aws-amplify/auth';
import { useState, useEffect } from "react";

export const useGetFromApi = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    
    if (!url) return;
    const getData = async () => {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString()
      try {
        setLoading(true);
        const getRequest = await get({apiName: "backend", path: url, headers: {Authorization: idToken}})
        const response = await getRequest.response
        response.body.json().then(setData)
      } catch ({ message }) {
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [url]);

  return { data, error, loading };
};
