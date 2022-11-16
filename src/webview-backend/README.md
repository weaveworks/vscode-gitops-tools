# `webview-backend` Directory

Types of content that can be contained here:

Individual JavaScript / TypeScript files that contain a class which manages the state and behavior of a given webview panel. Each class is usually in charge of:

- Creating and rendering the webview panel
- Properly cleaning up and disposing of webview resources when the panel is closed
- Setting message listeners so data can be passed between the webview and extension
- Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
- Other custom logic and behavior related to webview panel management


## `configureGitOps` Directort

This contains the application used to create Sources and Workloads.

- `Panel` is the vscode abstraction  for the webview tab in which it lives. It sends and receives messages from the `webapp-ui`
- `openPanel` creates the Panel and provides it with the current environment information
- `actions` module is for actions initiated by user in the webapp, for example when user a clicks a button that vscode must handle
- `lib` is the business logic
