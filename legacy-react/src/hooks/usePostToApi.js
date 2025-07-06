import { post } from "aws-amplify/api";
import { useState, useEffect, useRef } from "react";

export function usePostToApi(state, url) {
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const initRender = useRef(true);

  useEffect(() => {
    const postData = async () => {
      try {
        setPostLoading(true);
        const postRequest = await post({ apiName: "backend", path: url, options: { body: state } })
        const response = await postRequest.response
        response.body.json().then(console.log)
      } catch ({ message }) {
        setPostError(message);
      } finally {
        setPostLoading(false);
      }
    };
    if (initRender.current && state) {
      initRender.current = false;
    } else if (state) {
      postData();
    }
  }, [state, url]);

  return { postLoading, postError };
}
