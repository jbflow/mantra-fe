import { API } from "aws-amplify";
import { useState, useEffect, useRef } from "react";

export function usePostToApi(state, url) {
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const initRender = useRef(true);

  useEffect(() => {
    const postData = async () => {
      try {
        setPostLoading(true);
        await API.post("talkbackBE", url, { body: state });
      } catch ({ message }) {
        setPostError(message);
      } finally {
        setPostLoading(false);
      }
    };
    if (initRender.current && state) {
      console.log("init render", state);
      initRender.current = false;
    } else if (state) {
      console.log("post", state);
      postData();
    }
  }, [state, url]);

  return { postLoading, postError };
}
