
const ellipsis= (value, num) => {
    const nums = num || '30';// 设置限定字数,默认为5
    if (!value) return '';
    if (value.length > nums) {
      return value.slice(0, nums) + '...';
    }
    return value;
  };

  export {
      ellipsis,
  }