// it's like transform response function for channels
export const transformResponseForGetAllUsersTable = (response) => {
  const { pageNum, pageSize, totalCount } = response.meta;
  const entitiesCount = response.entities.length;

  const {
    systemRoleEnumPersian,
    studentPositionEnumPersian,
    lecturerPositionEnumPersian,
    // used only by the transform function for users of channel
    memberRoleEnumPersian,
  } = response;

  const offset = (pageNum - 1) * pageSize + 1;
  const rowNumberRange = [offset, offset + entitiesCount - 1];
  const totalPageCount =
    pageSize === 0
      ? 1 // pageSize: 0 means get all entites in one page
      : Math.ceil(totalCount / pageSize);
  response.meta = {
    ...response.meta,
    rowNumberRange,
    totalPageCount,
    entitiesCount,
  };
  response.entities = response.entities.map((entity, index) => {
    entity.rowNum = index + offset;

    // translation
    entity.system_role_persian = systemRoleEnumPersian?.[entity?.system_role];
    entity.student_position_persian =
      studentPositionEnumPersian?.[entity?.student_position];
    entity.lecturer_position_persian =
      lecturerPositionEnumPersian?.[entity?.lecturer_position];
    // used by transformResponseForGetUsersOfChannelTable
    // that function will call this function
    // because they have same functionality
    entity.member_role_persian = memberRoleEnumPersian?.[entity?.member_role];

    return entity;
  });
  return response;
};

export const transformResponseForGetUsersOfChannelTable = (response) => {
  return transformResponseForGetAllUsersTable(response);
};
