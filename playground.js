const logUrl = 'https://osc.gitee.work/opera_log_api/pipeline-log';

const parsedUrl = new URL(logUrl);

console.log({...parsedUrl.searchParams});