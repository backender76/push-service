interface Request {
  body?: any;
  headers?: any;
}

interface Response {
  send(data: any): void;
  status(data: any): Response;
}

const validation = {
  required: (value: any) => typeof value !== "undefined" && (!validation.string(value) || value !== ""),
  string: (value: any) => typeof value === "string",
  number: (value: any) => typeof value === "number",
  boolean: (value: any) => typeof value === "boolean",
};

type ValidatorName = keyof typeof validation;

export const rules: Record<"NOT_EMPTY_STRING", ValidatorName[]> = {
  NOT_EMPTY_STRING: ["required", "string"],
};

export type ValidationRules = Record<string, ValidatorName | ValidatorName[]>;

export const validate = (context: "body" | "headers", config: ValidationRules) => {
  return function (req: Request, res: Response, next: (err?: any) => void) {
    for (let field in config) {
      const rules = Array.isArray(config[field]) ? config[field] : [config[field]];

      for (let rule of rules) {
        const value = req[context] && req[context][field];

        if (!validation[rule](value)) {
          const msg = rule === "required" ? `is ${rule}` : `must be a ${rule}`;
          const error = `Field "${field}" ${msg}!`;
          console.warn(JSON.stringify({ error }));
          return res.status(400).send({ error });
        }
      }
    }
    next();
  };
};
