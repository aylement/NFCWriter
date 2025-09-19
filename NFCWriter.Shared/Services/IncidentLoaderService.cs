using System.Text.Json;
using Microsoft.Maui.Storage;
using NFCWriter.Shared.DTOs;

namespace NFCWriter.Shared.Services
{
    public static class IncidentLoaderService
    {
        /// <summary>
        /// Loads incidents from the app package (Resources/Raw folder)
        /// </summary>
        /// <param name="fileName">The file name, e.g., "incidents.json"</param>
        /// <returns>List of incidents</returns>
        public static async Task<List<Incident>> LoadIncidentsFromAppPackageAsync(string fileName)
        {
            try
            {
                using var stream = await FileSystem.OpenAppPackageFileAsync(fileName);
                using var reader = new StreamReader(stream);
                var json = await reader.ReadToEndAsync();

                var incidents = JsonSerializer.Deserialize<List<Incident>>(json);
                return incidents ?? new List<Incident>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading incidents from app package: {ex}");
                return new List<Incident>();
            }
        }
    }
}