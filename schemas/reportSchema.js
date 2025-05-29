const { z } = require("zod");

const reportSchema = z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be in YYYY-MM-DD '),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be in YYYY-MM-DD'),
    department: z.string().optional(),
});

module.exports ={ reportSchema };