import React, { forwardRef } from "react";

export type ListProps = {
  direction?: 'vertical' | 'horizontal';
  children: React.ReactNode;
};

export type ListItemProps = {
  children: React.ReactNode;
};

export function List({ direction, ...rest }: ListProps) {
  return (
    <ul
      className={`p-0 ${direction === 'horizontal' ? 'flex' : 'block'} list-group list-group-dark`}
      {...rest}
    />
  );
}

export const ListItem = forwardRef<React.ComponentRef<'li'>, ListItemProps>(
  function ListItem(props, ref) {
    return <li ref={ref} className="m-0 border bg-slate-200 p-0" {...props} />;
  },
);

export function Loading() {
  return (
    <div className="animate-pulse bg-slate-600 p-2 text-white">Loading...</div>
  );
}

/*
interface Response {
  hasNextPage: boolean;
  data: IQuestion[];
}

const ARRAY_SIZE = 20;
const RESPONSE_TIME_IN_MS = 1000;

function loadItems(startCursor = 0): Promise<Response> {
  return new Promise((resolve) => {
    let newArray: IQuestion[] = [];

    setTimeout(() => {
      for (let id = startCursor; id < startCursor + ARRAY_SIZE; id++) {
        const newItem = {
          id,
          title: `This is item ${id.toString()}`,
          wsId: '',
          level: 0,
          parentCategory: 'SAFARI',
          questionAnswers: [],
          source: 0,
          status: 0
        };
        newArray = [...newArray, newItem];
      }

      resolve({ hasNextPage: true, data: newArray });
    }, RESPONSE_TIME_IN_MS);
  });
}


export function useLoadQuestions() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  async function loadMore() {
    setLoading(true);
    try {
      const { data, hasNextPage: newHasNextPage } = await loadItems(questions.length);
      setQuestions((current) => [...current, ...data]);
      setHasNextPage(newHasNextPage);
    }
    catch (error_) {
      setError(
        error_ instanceof Error ? error_ : new Error('Something went wrong'),
      );
    }
    finally {
      setLoading(false);
    }
  }

  return { loading, questions, hasNextPage, error, loadMore };
}
*/