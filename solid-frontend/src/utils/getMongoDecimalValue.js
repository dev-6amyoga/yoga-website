export const getMongoDecimalValue = (val) => {
	return val ? parseFloat(val.$numberDecimal) : 0;
};
