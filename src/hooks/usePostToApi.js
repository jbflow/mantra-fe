import { post } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { useState, useEffect, useRef } from "react";

export function usePostToApi(state, url) {
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const initRender = useRef(true);

  useEffect(() => {
    const postData = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString()
        setPostLoading(true);
        const postRequest = await post({ apiName: "backend", path: url, options: { body: state }, headers: {Authorization: idToken} })
        const response = await postRequest.response
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
