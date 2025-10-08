using System.Text.Json;

public class TagStorageService : ITagStorageService
{
    private readonly string _filePath;

    public TagStorageService()
    {
        _filePath = Path.Combine(FileSystem.AppDataDirectory, "tags.json");
    }

    public async Task<List<string>> LoadTagsAsync()
    {
        if (!File.Exists(_filePath))
            return new List<string>();

        try
        {
            var json = await File.ReadAllTextAsync(_filePath);
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    public async Task SaveTagsAsync(List<string> tags)
    {
        var json = JsonSerializer.Serialize(tags, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(_filePath, json);
    }

    public async Task AddTagAsync(string tag)
    {
        var tags = await LoadTagsAsync();

        if (!tags.Contains(tag))
        {
            tags.Add(tag);
            await SaveTagsAsync(tags);
        }
    }

    public async Task ClearTagsAsync()
    {
        if (File.Exists(_filePath))
            File.Delete(_filePath);
    }
}