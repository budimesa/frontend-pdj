export const formatIDR = (value) => {
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
    
    return `Rp ${formattedValue}`;
};

export const formatThousand = (value) => {
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
    
    return `${formattedValue}`;
};