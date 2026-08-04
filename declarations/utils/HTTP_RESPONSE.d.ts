export declare const HTTP_RESPONSES: {
    readonly CONTINUE: {
        readonly code: 100;
        readonly message: "Continue";
    };
    readonly SWITCHING_PROTOCOLS: {
        readonly code: 101;
        readonly message: "Switching Protocols";
    };
    readonly PROCESSING: {
        readonly code: 102;
        readonly message: "Processing";
    };
    readonly EARLY_HINTS: {
        readonly code: 103;
        readonly message: "Early Hints";
    };
    readonly OK: {
        readonly code: 200;
        readonly message: "OK";
    };
    readonly CREATED: {
        readonly code: 201;
        readonly message: "Created";
    };
    readonly ACCEPTED: {
        readonly code: 202;
        readonly message: "Accepted";
    };
    readonly NON_AUTHORITATIVE_INFORMATION: {
        readonly code: 203;
        readonly message: "Non-Authoritative Information";
    };
    readonly NO_CONTENT: {
        readonly code: 204;
        readonly message: "No Content";
    };
    readonly RESET_CONTENT: {
        readonly code: 205;
        readonly message: "Reset Content";
    };
    readonly PARTIAL_CONTENT: {
        readonly code: 206;
        readonly message: "Partial Content";
    };
    readonly MULTI_STATUS: {
        readonly code: 207;
        readonly message: "Multi-Status";
    };
    readonly ALREADY_REPORTED: {
        readonly code: 208;
        readonly message: "Already Reported";
    };
    readonly IM_USED: {
        readonly code: 226;
        readonly message: "IM Used";
    };
    readonly MULTIPLE_CHOICES: {
        readonly code: 300;
        readonly message: "Multiple Choices";
    };
    readonly MOVED_PERMANENTLY: {
        readonly code: 301;
        readonly message: "Moved Permanently";
    };
    readonly FOUND: {
        readonly code: 302;
        readonly message: "Found";
    };
    readonly SEE_OTHER: {
        readonly code: 303;
        readonly message: "See Other";
    };
    readonly NOT_MODIFIED: {
        readonly code: 304;
        readonly message: "Not Modified";
    };
    readonly USE_PROXY: {
        readonly code: 305;
        readonly message: "Use Proxy";
    };
    readonly TEMPORARY_REDIRECT: {
        readonly code: 307;
        readonly message: "Temporary Redirect";
    };
    readonly PERMANENT_REDIRECT: {
        readonly code: 308;
        readonly message: "Permanent Redirect";
    };
    readonly BAD_REQUEST: {
        readonly code: 400;
        readonly message: "Bad Request";
    };
    readonly UNAUTHORIZED: {
        readonly code: 401;
        readonly message: "Unauthorized";
    };
    readonly PAYMENT_REQUIRED: {
        readonly code: 402;
        readonly message: "Payment Required";
    };
    readonly FORBIDDEN: {
        readonly code: 403;
        readonly message: "Forbidden";
    };
    readonly NOT_FOUND: {
        readonly code: 404;
        readonly message: "Not Found";
    };
    readonly METHOD_NOT_ALLOWED: {
        readonly code: 405;
        readonly message: "Method Not Allowed";
    };
    readonly NOT_ACCEPTABLE: {
        readonly code: 406;
        readonly message: "Not Acceptable";
    };
    readonly PROXY_AUTHENTICATION_REQUIRED: {
        readonly code: 407;
        readonly message: "Proxy Authentication Required";
    };
    readonly REQUEST_TIMEOUT: {
        readonly code: 408;
        readonly message: "Request Timeout";
    };
    readonly CONFLICT: {
        readonly code: 409;
        readonly message: "Conflict";
    };
    readonly GONE: {
        readonly code: 410;
        readonly message: "Gone";
    };
    readonly LENGTH_REQUIRED: {
        readonly code: 411;
        readonly message: "Length Required";
    };
    readonly PRECONDITION_FAILED: {
        readonly code: 412;
        readonly message: "Precondition Failed";
    };
    readonly CONTENT_TOO_LARGE: {
        readonly code: 413;
        readonly message: "Content Too Large";
    };
    readonly URI_TOO_LONG: {
        readonly code: 414;
        readonly message: "URI Too Long";
    };
    readonly UNSUPPORTED_MEDIA_TYPE: {
        readonly code: 415;
        readonly message: "Unsupported Media Type";
    };
    readonly RANGE_NOT_SATISFIABLE: {
        readonly code: 416;
        readonly message: "Range Not Satisfiable";
    };
    readonly EXPECTATION_FAILED: {
        readonly code: 417;
        readonly message: "Expectation Failed";
    };
    readonly IM_A_TEAPOT: {
        readonly code: 418;
        readonly message: "I'm a Teapot";
    };
    readonly MISDIRECTED_REQUEST: {
        readonly code: 421;
        readonly message: "Misdirected Request";
    };
    readonly UNPROCESSABLE_CONTENT: {
        readonly code: 422;
        readonly message: "Unprocessable Content";
    };
    readonly LOCKED: {
        readonly code: 423;
        readonly message: "Locked";
    };
    readonly FAILED_DEPENDENCY: {
        readonly code: 424;
        readonly message: "Failed Dependency";
    };
    readonly TOO_EARLY: {
        readonly code: 425;
        readonly message: "Too Early";
    };
    readonly UPGRADE_REQUIRED: {
        readonly code: 426;
        readonly message: "Upgrade Required";
    };
    readonly PRECONDITION_REQUIRED: {
        readonly code: 428;
        readonly message: "Precondition Required";
    };
    readonly TOO_MANY_REQUESTS: {
        readonly code: 429;
        readonly message: "Too Many Requests";
    };
    readonly REQUEST_HEADER_FIELDS_TOO_LARGE: {
        readonly code: 431;
        readonly message: "Request Header Fields Too Large";
    };
    readonly UNAVAILABLE_FOR_LEGAL_REASONS: {
        readonly code: 451;
        readonly message: "Unavailable For Legal Reasons";
    };
    readonly INTERNAL_SERVER_ERROR: {
        readonly code: 500;
        readonly message: "Internal Server Error";
    };
    readonly NOT_IMPLEMENTED: {
        readonly code: 501;
        readonly message: "Not Implemented";
    };
    readonly BAD_GATEWAY: {
        readonly code: 502;
        readonly message: "Bad Gateway";
    };
    readonly SERVICE_UNAVAILABLE: {
        readonly code: 503;
        readonly message: "Service Unavailable";
    };
    readonly GATEWAY_TIMEOUT: {
        readonly code: 504;
        readonly message: "Gateway Timeout";
    };
    readonly HTTP_VERSION_NOT_SUPPORTED: {
        readonly code: 505;
        readonly message: "HTTP Version Not Supported";
    };
    readonly VARIANT_ALSO_NEGOTIATES: {
        readonly code: 506;
        readonly message: "Variant Also Negotiates";
    };
    readonly INSUFFICIENT_STORAGE: {
        readonly code: 507;
        readonly message: "Insufficient Storage";
    };
    readonly LOOP_DETECTED: {
        readonly code: 508;
        readonly message: "Loop Detected";
    };
    readonly NOT_EXTENDED: {
        readonly code: 510;
        readonly message: "Not Extended";
    };
    readonly NETWORK_AUTHENTICATION_REQUIRED: {
        readonly code: 511;
        readonly message: "Network Authentication Required";
    };
};
