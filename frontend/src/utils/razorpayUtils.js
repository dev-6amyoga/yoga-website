export const paymentMethodConfig = {
    display: {
        blocks: {
            banks: {
                name: "All payment methods",
                instruments: [
                    {
                        method: "upi",
                    },
                    {
                        method: "card",
                    },
                    {
                        method: "wallet",
                    },
                    {
                        method: "netbanking",
                    },
                ],
            },
        },
        sequence: ["block.banks"],
        preferences: {
            show_default_blocks: false,
        },
    },
};
