import * as azdev from "azure-devops-node-api";
import GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";
import { GitApi } from "azure-devops-node-api/GitApi";
import { PolicyApi } from "azure-devops-node-api/PolicyApi";


export default class AzureDevOpsReposManager {

    private readonly connection: azdev.WebApi;

    constructor(orgUrl: string, token: string) {
        this.connection = new azdev.WebApi(orgUrl, azdev.getPersonalAccessTokenHandler(token));
    }

    async getDefaultBranchOf(projectName: string, repositoryName: string): Promise<string> {
        const gitApiObject: GitApi = await this.getGitApi();
        const repos = await gitApiObject.getRepositories(projectName);
        const repo = repos.find(r => r.name === repositoryName);
        return repo?.defaultBranch ?? "";
    }

    async createNewBranchBasedOnDefaultBranchOfRepository(projectName: string, repositoryName: string, nameOfNewBranch: string): Promise<GitInterfaces.GitRefUpdateResult[]> {
        return await this.createNewBranchBasedOnBranchWithName(projectName, repositoryName, nameOfNewBranch, await this.getDefaultBranchOf(projectName, repositoryName));
    }

    async createNewBranchBasedOnBranchWithName(projectName: string, repositoryName: string, nameOfNewBranch: string, basedBranchName: string): Promise<GitInterfaces.GitRefUpdateResult[]> {
        const gitApiObject: GitApi = await this.getGitApi();
        const baseBranch = await gitApiObject.getRefs(repositoryName, projectName, basedBranchName.replace("refs/", ""));
        const newBranch = [{
            name: `refs/heads/${nameOfNewBranch}`,
            oldObjectId: "0000000000000000000000000000000000000000",
            newObjectId: baseBranch[0].objectId
        }];
        return await gitApiObject.updateRefs(newBranch, repositoryName, projectName);
    }

    async applyAllPoliciesInOneBranchBasedOnDefaultBranch(projectName: string, repositoryName: string, targetBranchName: string): Promise<void> {
        const policyApiObject: PolicyApi = await this.getPoliciesApi();
        const policies = await policyApiObject.getPolicyConfigurations(projectName);
        const defaultBranchName = await this.getDefaultBranchOf(projectName, repositoryName);

        // Iterate over the returned policies
        for (let policy of policies) {
            // Check if the policy is for the default branch
            if (policy.settings.scope[0].refName === defaultBranchName) {
                // Change the refName to the new branch
                policy.settings.scope[0].refName = targetBranchName;
                // Create the new policy
                await policyApiObject.createPolicyConfiguration(policy, projectName);
            }
        }
    }

    private async getGitApi(): Promise<GitApi> {
        return await this.connection.getGitApi();
    }

    private async getPoliciesApi(): Promise<PolicyApi> {
        return await this.connection.getPolicyApi();
    }
}
