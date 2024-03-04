const azdev = require("azure-devops-node-api");
const PolicyApi = require("azure-devops-node-api/PolicyApi");

// your collection url
let orgUrl = "https://dev.azure.com/brunoyurijacinto";

// access token
let token = "lrfa2pilfrpawrrcptmckobi2h72kh65rl5jxntxuzyvj4pluesa";

let authHandler = azdev.getPersonalAccessTokenHandler(token);
let connection = new azdev.WebApi(orgUrl, authHandler);

async function createBranchAndCopyPolicies() {
    const gitApiObject = await connection.getGitApi();
    const policyApiObject = await connection.getPolicyApi();
    const project = "PacktAzureDevOps";
    const repositoryId = "PacktAzureDevOps";
    //Get current time and convertto string 
    const date = new Date();
    const dateString = date.toISOString().replace(/:/g, "-").replace(/\./g, "-");

    const newBranchName = `refs/heads/${dateString}`;

    // Get the default branch
    const repos = await gitApiObject.getRepositories(project);
    const repo = repos.find(r => r.name === repositoryId);
    const defaultBranchName = repo.defaultBranch;

    // Create the new branch
    const baseBranch = await gitApiObject.getRefs(repositoryId, project, "heads/main");
    const newBranch = [{
        name: newBranchName,
        oldObjectId: "0000000000000000000000000000000000000000",
        newObjectId: baseBranch[0].objectId
    }];
    await gitApiObject.updateRefs(newBranch, repositoryId, project);

    // Get the policies applied to the default branch
    const policies = await policyApiObject.getPolicyConfigurations(project);

    // Iterate over the returned policies
    for (let policy of policies) {
        // Check if the policy is for the default branch
        if (policy.settings.scope[0].refName === defaultBranchName) {
            // Change the refName to the new branch
            policy.settings.scope[0].refName = newBranchName;
            // Create the new policy
            await policyApiObject.createPolicyConfiguration(policy, project);
        }
    }
}

createBranchAndCopyPolicies();