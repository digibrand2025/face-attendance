export const Config = {
    LAMBDA_URLS: {
        RECOGNIZE_FACE: 'https://bq7qhsumaz4ejr5zd7dua645ky0vyczb.lambda-url.ap-southeast-1.on.aws/',
        ENROLL_STUDENT: 'https://cpjvwomvgaat5vjdfp7nok7sku0vvasz.lambda-url.ap-southeast-1.on.aws/',
        CREATE_COLLECTION: 'https://ck3sflynoojoliyi27cih53tmi0phxvt.lambda-url.ap-southeast-1.on.aws/',
        LIST_FACES: 'https://os4vuewaouwvj7clt5q3kejwgq0rzvwu.lambda-url.ap-southeast-1.on.aws/',
    },
    PHP_API: {
        MARK_ATTENDANCE: 'https://yourphpserver.com/api/attendance.php', // Placeholder
        GET_STUDENTS: 'https://yourphpserver.com/api/students.php'
    },
    DEFAULT_INSTITUTE_ID: 'INST001',
    CONFIDENCE_THRESHOLD: 95,
    IMAGE_QUALITY: 0.5,
    MAX_IMAGE_SIZE: 1024 * 1024, // 1MB
    REQUEST_TIMEOUT: 30000 // 30 seconds
};
