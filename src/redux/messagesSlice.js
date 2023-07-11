// it's like transform response function for channels
// but attaches fetched channel object to each message entity
export const transformResponseForGetMessagesOfChannel = (response) => {
  const {pageNum, pageSize, totalCount} = response.meta;
  const entitiesCount = response.entities.length;

  const channel = response?.channel;

  const offset = (pageNum - 1) * pageSize + 1;
  const rowNumberRange = [offset, offset + entitiesCount - 1];
  const totalPageCount = 
        pageSize === 0 ? 
            1 // pageSize: 0 means get all entites in one page 
            : Math.ceil(totalCount / pageSize);
    response.meta = {
        ...response.meta,
        rowNumberRange,
        totalPageCount,
        entitiesCount,
    }
    response.entities = response.entities.map((entity, index) => {
        entity.rowNum = index + offset;
        entity.channel = channel;
        return entity;
    });
    return response;
}