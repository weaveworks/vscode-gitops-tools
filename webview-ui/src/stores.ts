import { createSignal } from 'solid-js';
const [ githubUser, setGithubUser ] = createSignal('USERNAME');

export { githubUser, setGithubUser };

// https://stackoverflow.com/questions/46511595/how-to-access-the-api-for-git-in-visual-studio-code
