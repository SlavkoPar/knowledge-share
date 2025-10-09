import React, { useEffect } from "react";
import { ICategoryKey, IVariation } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
// import { useGlobalState } from "global/GlobalProvider";
//import { List, ListItem, Loading } from "common/components/InfiniteList";
import VariationRow from "categories/VariationRow";
import { Stack } from "react-bootstrap";

const VariationList = ({ categoryKey, variations }: { categoryKey: ICategoryKey, variations: IVariation[] }) => {

  //const { canEdit } = useGlobalState();

  const { state } = useCategoryContext();
  const {  error } = state; // topRows: categories,


  //const group = categories.find(c => c.id === parentId)!
  // const { tags, numOfTags, hasMore } = group;

  useEffect(() => {
  }, [])


  // useEffect(() => {
  //   if (groupId != null) {
  //     if (groupId === parentId!.toString() && tagId) {
  //       setTimeout(() => {
  //         if (canEdit)
  //           editTag(parseInt(tagId))
  //         else
  //           viewTag(parseInt(tagId))
  //       }, 3000)
  //     }
  //   }
  // }, [viewTag, parentId, groupId, tagId, canEdit]);

  // console.log('TagList render', tags, level)

  return (
    <div
      className="ms-2"
    // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
    // style={{ overflowX: 'auto' }}
    >
      <Stack direction="horizontal" gap={2}>
        {variations.length === 0 &&
          <div>No variations</div>
        }
        {variations.length > 0 &&
          variations.map((tag: IVariation) => {
            return <VariationRow
              categoryKey={categoryKey}
              tag={tag}
              categoryInAdding={undefined}
            />
          })}
      </Stack>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default VariationList;
