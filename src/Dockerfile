FROM mcr.microsoft.com/dotnet/sdk:7.0 as builder

WORKDIR /src
COPY ./ /src

RUN dotnet publish --configuration Release -o ./bin ./web/web.csproj

FROM mcr.microsoft.com/dotnet/aspnet:7.0

LABEL maintainer="seba gomez <@sebagomez>"

ARG BUILD
ENV APPVERSION=$BUILD

WORKDIR /app

COPY --from=builder /src/bin ./

ENTRYPOINT ["dotnet", "web.dll"]
