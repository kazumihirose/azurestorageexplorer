using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

using StorageLibrary.Common;
using StorageLibrary.Interfaces;

namespace StorageLibrary.Mocks
{
	internal class MockContainer : IContainer
	{
		static readonly string FAKE_URL = "https://this.is.fake";
		static Dictionary<string, List<string>> s_containers = new Dictionary<string, List<string>>()
		{
			{ "one", new List<string> {"fromOne:1", "fromOne:2", "fromOne:3"}},
			{ "two", new List<string> {"fromTwo:1", "fromTwo:2"}},
			{ "three", new List<string> {"fromThree:1"}},
			{ "empty", new List<string> {}},
			{ "with-folder", new List<string> {"root-file", "folder1/", "folder1/file"}},
			{ "with-many-folders", new List<string> {"file-at-root", "folder1/", "folder1/file1", "folder1/folder11/", "folder1/folder11/file-at-11", "folder1/folder11/another-file-at-11"}},
			{ "brothers", new List<string> {"ale/", "seba/", "ale/lauti", "ale/alfo", "ale/ciro", "seba/jose", "seba/juan", "seba/benja" }},
		};

		public async Task<List<CloudBlobContainerWrapper>> ListContainersAsync()
		{
			return await Task.Run(() =>
			{
				List<CloudBlobContainerWrapper> retList = new List<CloudBlobContainerWrapper>();
				foreach (string key in s_containers.Keys)
					retList.Add(new CloudBlobContainerWrapper { Name = key });

				return retList;
			});
		}

		public async Task<List<BlobItemWrapper>> ListBlobsAsync(string containerName, string path)
		{
			return await Task.Run(() =>
			{
				if (!s_containers.ContainsKey(containerName))
					throw new NullReferenceException($"Container '{containerName}' does not exist");

				List<BlobItemWrapper> results = new List<BlobItemWrapper>();
				var rand = new Random();
				foreach (string val in s_containers[containerName])
				{
					int slash = val.LastIndexOf("/");

					string[] deep = path.Split("/", StringSplitOptions.RemoveEmptyEntries);
					string[] dirs = val.Split("/", StringSplitOptions.RemoveEmptyEntries);

					if (!string.IsNullOrEmpty(path))
					{
						if (val == path)
							continue;

						if (dirs.Length > (deep.Length + 1) || dirs.Length <= deep.Length)
							continue;

						bool inCurrentDir = true;
						if (dirs.Length >= deep.Length)
						{
							for(int i = 0; i < dirs.Length -1; i++)
							{
								if (dirs[i] != deep[i])
								{
									inCurrentDir &= false;
									break;
								}
							}
						}

						if (inCurrentDir)
							results.Add(new BlobItemWrapper($"{FAKE_URL}/{containerName}/{val}", rand.NextInt64(512, 5* 1024 * 1024)));
					}
					else
					{
						if (dirs.Length > 1)
							continue;

						results.Add(new BlobItemWrapper($"{FAKE_URL}/{containerName}/{val}", rand.NextInt64(512, 5* 1024 * 1024)));
					}
				}

				return results;
			});
		}

		public async Task CreateAsync(string containerName, bool publicAccess)
		{
			await Task.Run(() =>
			{
				if (s_containers.ContainsKey(containerName))
					throw new InvalidOperationException($"Container '{containerName}' already exists");

				s_containers.Add(containerName, new List<string>());
			});
		}

		public async Task DeleteBlobAsync(string containerName, string blobName)
		{
			await Task.Run(() =>
			{
				if (!s_containers.ContainsKey(containerName))
					throw new NullReferenceException($"Container '{containerName}' does not exist");

				if (!s_containers[containerName].Contains(blobName))
					throw new NullReferenceException($"Blob '{blobName}' does not exist in Container '{containerName}'");

				s_containers[containerName].Remove(containerName);
			});
		}

		public async Task CreateBlobAsync(string containerName, string blobName, Stream fileContent)
		{
			await Task.Run(() =>
			{
				if (!s_containers.ContainsKey(containerName))
					throw new NullReferenceException($"Container '{containerName}' does not exist");

				if (s_containers[containerName].Contains(blobName))
					throw new InvalidOperationException($"Blob '{blobName}' already exists in Container '{containerName}'");

				s_containers[containerName].Add(blobName);
			});
		}

		public async Task<string> GetBlobAsync(string containerName, string blobName)
		{
			return await Task.Run(() =>
			{
				if (!s_containers.ContainsKey(containerName))
					throw new NullReferenceException($"Container '{containerName}' does not exist");

				if (!s_containers[containerName].Contains(blobName))
					throw new InvalidOperationException($"Blob '{blobName}' does not exist in Container '{containerName}'");

				return blobName;
			});
		}

		public async Task DeleteAsync(string containerName)
		{
			await Task.Run(() =>
			{
				if (!s_containers.ContainsKey(containerName))
					throw new NullReferenceException($"Container '{containerName}' does not exist");

				s_containers.Remove(containerName);
			});
		}
	}
}
