import { get } from "aws-amplify/api";
import { useState, useEffect } from "react";

export const useGetFromApi = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log("WHY ARE YOU NOT WORKING", url)
  useEffect(() => {
    console.log("URl", url)
    if (!url) return;
    const getData = async () => {
      try {
        setLoading(true);
        console.log("TRYING TO FETCH")
        setData(await get({apiName: "talkbackBE", path: url}));
      } catch ({ message }) {
        console.log("FAILED")
        setError(message);
      } finally {
        console.log("FINALLY")
        setLoading(false);
      }
    };
    getData();
  }, []);

  return { data, error, loading };
};
