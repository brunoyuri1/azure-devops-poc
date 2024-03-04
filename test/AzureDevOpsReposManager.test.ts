
import AzureDevOpsReposManager from "../src/AzureDevOpsReposManager";
import GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";

test("Should return default branch of the repository specified", async function () {
    const orgUrl = "";
    const userToken = "";
    const projectName = "PacktAzureDevOps";
    const repositoryName = "PacktAzureDevOps";

    let azureConnectionManager: AzureDevOpsReposManager = new AzureDevOpsReposManager(orgUrl, userToken);
    let defaultBranch: string = await azureConnectionManager.getDefaultBranchOf(projectName, repositoryName);

    expect(defaultBranch).toBeDefined();
    expect(defaultBranch).toBe("refs/heads/main");
});

test("Should return an empty, if default branch not founded", async function () {
    const orgUrl = "";
    const userToken = "";
    const projectName = "PacktAzureDevOps";
    const repositoryName = "PacktAzureDevOps2";

    let azureConnectionManager: AzureDevOpsReposManager = new AzureDevOpsReposManager(orgUrl, userToken);
    let defaultBranch: string = await azureConnectionManager.getDefaultBranchOf(projectName, repositoryName);

    expect(defaultBranch).toBeDefined();
    expect(defaultBranch).toBe("");
});

test("Should create a branch based on the default branch of the repository", async function () {
    const orgUrl = "";
    const userToken = "";
    const projectName = "PacktAzureDevOps";
    const repositoryName = "PacktAzureDevOps";
    const date = new Date();
    const dateString = date.toISOString().replace(/:/g, "-").replace(/\./g, "-");
    const branchName = `${dateString}`;

    let azureConnectionManager: AzureDevOpsReposManager = new AzureDevOpsReposManager(orgUrl, userToken);
    const branchCreated: GitInterfaces.GitRefUpdateResult[] = await azureConnectionManager.createNewBranchBasedOnDefaultBranchOfRepository(projectName, repositoryName, branchName);

    expect(branchCreated).toBeDefined();
    expect(branchCreated.length).toBe(1);
    expect(branchCreated[0].name).toBe(`refs/heads/${branchName}`);
    expect(branchCreated[0].success).toBe(true);
    expect(branchCreated[0].newObjectId).toBeDefined();
});

test("Should create a branch based on the specified branch", async function () {
    const orgUrl = "";
    const userToken = "";
    const projectName = "PacktAzureDevOps";
    const repositoryName = "PacktAzureDevOps";
    const date = new Date();
    const dateString = date.toISOString().replace(/:/g, "-").replace(/\./g, "-");
    const nameOfNewBranch = `${dateString}`;
    const basedBranchName = "refs/heads/main";

    let azureConnectionManager: AzureDevOpsReposManager = new AzureDevOpsReposManager(orgUrl, userToken);
    const branchCreated: GitInterfaces.GitRefUpdateResult[] = await azureConnectionManager.createNewBranchBasedOnBranchWithName(projectName, repositoryName, nameOfNewBranch, basedBranchName);

    expect(branchCreated).toBeDefined();
    expect(branchCreated.length).toBe(1);
    expect(branchCreated[0].name).toBe(`refs/heads/${nameOfNewBranch}`);
    expect(branchCreated[0].success).toBe(true);
    expect(branchCreated[0].newObjectId).toBeDefined();
});

test("Should apply all policies in one branch based on default branch", async function () {
    const orgUrl = "";
    const userToken = "";
    const projectName = "PacktAzureDevOps";
    const repositoryName = "PacktAzureDevOps";
    const branchName = "2024-03-04T02-14-25-165Z-teste5";

    let azureConnectionManager: AzureDevOpsReposManager = new AzureDevOpsReposManager(orgUrl, userToken);
    await azureConnectionManager.applyAllPoliciesInOneBranchBasedOnDefaultBranch(projectName, repositoryName, `refs/heads/${branchName}`);
});
