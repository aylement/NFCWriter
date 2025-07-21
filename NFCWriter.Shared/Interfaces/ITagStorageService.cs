public interface ITagStorageService
{
    Task<List<string>> LoadTagsAsync();
    Task SaveTagsAsync(List<string> tags);
    Task AddTagAsync(string tag);
    Task ClearTagsAsync();
}