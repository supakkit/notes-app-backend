import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";


extendZodWithOpenApi(z);

export { z }; // export this version of Zod for all schemas
