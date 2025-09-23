using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.JSInterop;

public class BombermanHubClient : IAsyncDisposable
{
    private readonly IJSRuntime _js;
    private HubConnection? _hubConnection;

    public BombermanHubClient(IJSRuntime js)
    {
        _js = js;
    }

    public async Task StartAsync(string serverUrl)
    {
        _hubConnection = new HubConnectionBuilder()
            .WithUrl($"{serverUrl}/bombermanhub")
            .WithAutomaticReconnect()
            .Build();

        // When another player moves
        _hubConnection.On<string>("ReceiveMove", async direction =>
        {
            await _js.InvokeVoidAsync("bomberman.remoteMove", direction);
        });

        // When another player places a bomb
        _hubConnection.On("ReceiveBomb", async () =>
        {
            await _js.InvokeVoidAsync("bomberman.remoteBomb");
        });

        // Reset game
        _hubConnection.On("ReceiveReset", async () =>
        {
            await _js.InvokeVoidAsync("bomberman.reset");
        });

        await _hubConnection.StartAsync();
    }

    public async Task SendMove(string direction)
    {
        if (_hubConnection != null)
            await _hubConnection.SendAsync("SendMove", direction);
    }

    public async Task SendBomb()
    {
        if (_hubConnection != null)
            await _hubConnection.SendAsync("SendBomb");
    }

    public async Task SendReset()
    {
        if (_hubConnection != null)
            await _hubConnection.SendAsync("SendReset");
    }

    public async ValueTask DisposeAsync()
    {
        if (_hubConnection != null)
            await _hubConnection.DisposeAsync();
    }
}