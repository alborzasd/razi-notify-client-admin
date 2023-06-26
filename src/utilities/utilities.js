export function paginate(array, pageSize, pageNum){
    return array.slice((pageNum - 1) * pageSize, pageNum * pageSize);
}