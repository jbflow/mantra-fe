import { get } from "aws-amplify/api";
import { useState, useEffect } from "react";

export const useGetFromApi = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!url) return;
    const getData = async () => {
      try {
        setLoading(true);
        const getRequest = get({apiName: "backend", path: url})
        const response = await getRequest.response
        setData(response.body.json());
      } catch ({ message }) {
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return { data, error, loading };
};
